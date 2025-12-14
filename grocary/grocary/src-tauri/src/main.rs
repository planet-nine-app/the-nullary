// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, Manager};
use serde_json::json;

// Check if grocery service is available
#[command]
async fn check_grocery_service(service_url: String) -> Result<bool, String> {
    println!("🔍 [RUST] check_grocery_service called with URL: {}", service_url);

    let client = reqwest::Client::new();
    println!("🔍 [RUST] Making GET request to: {}", service_url);

    match client.get(&service_url).send().await {
        Ok(response) => {
            let status = response.status();
            println!("🔍 [RUST] Got response with status: {}", status);
            // Accept any response (even 404) as proof the service is running
            // The service doesn't have a root endpoint, so 404 is expected
            println!("🔍 [RUST] Service is reachable! Returning true");
            Ok(true)
        },
        Err(e) => {
            println!("❌ [RUST] Request failed with error: {}", e);
            Ok(false)
        },
    }
}

// Generate sessionless keypair
#[command]
fn generate_keys() -> Result<String, String> {
    println!("🔑 [RUST] Generating new keypair...");

    let sessionless = sessionless::Sessionless::new();
    let private_key_hex = hex::encode(sessionless.private_key().as_ref());
    let public_key_hex = hex::encode(sessionless.public_key().serialize());

    println!("🔑 [RUST] Generated public key: {}", public_key_hex);

    let result = json!({
        "privateKey": private_key_hex,
        "publicKey": public_key_hex
    });

    Ok(result.to_string())
}

// Create grocery user via service with real sessionless signature
#[command]
async fn create_grocery_user(service_url: String, private_key_hex: String) -> Result<String, String> {
    println!("🔍 [RUST] create_grocery_user called");
    println!("🔍 [RUST] Service URL: {}", service_url);

    // Decode private key
    let private_key_bytes = hex::decode(&private_key_hex)
        .map_err(|e| format!("Failed to decode private key: {}", e))?;

    // Convert bytes to PrivateKey
    let private_key = sessionless::PrivateKey::from_slice(&private_key_bytes)
        .map_err(|e| format!("Failed to create private key: {}", e))?;

    let sessionless = sessionless::Sessionless::from_private_key(private_key);

    let public_key_hex = hex::encode(sessionless.public_key().serialize());
    let timestamp = chrono::Utc::now().timestamp_millis();

    // Create signature: sign(timestamp)
    let message = timestamp.to_string();
    let signature = sessionless.sign(message.as_bytes());
    let signature_hex = hex::encode(signature.serialize_compact());

    println!("🔍 [RUST] Public key: {}", public_key_hex);
    println!("🔍 [RUST] Timestamp: {}", timestamp);
    println!("🔍 [RUST] Signature: {}", signature_hex);

    let client = reqwest::Client::new();
    let body = json!({
        "pubKey": public_key_hex,
        "timestamp": timestamp,
        "signature": signature_hex
    });

    println!("🔍 [RUST] Sending request to: {}/user/create", service_url);
    println!("🔍 [RUST] Request body: {}", body);

    match client.put(&format!("{}/user/create", service_url))
        .json(&body)
        .send()
        .await
    {
        Ok(response) => {
            let status = response.status();
            println!("🔍 [RUST] Response status: {}", status);
            let text = response.text().await.map_err(|e| e.to_string())?;
            println!("🔍 [RUST] Response body: {}", text);
            Ok(text)
        },
        Err(e) => {
            println!("❌ [RUST] Request error: {}", e);
            Err(e.to_string())
        },
    }
}

// Connect to Kroger OAuth
#[command]
async fn connect_kroger(service_url: String, user_uuid: String, timestamp: i64, signature: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "timestamp": timestamp,
        "signature": signature
    });

    match client.post(&format!("{}/user/{}/oauth/kroger/authorize", service_url, user_uuid))
        .json(&body)
        .send()
        .await
    {
        Ok(response) => {
            let text = response.text().await.map_err(|e| e.to_string())?;
            Ok(text)
        },
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Inject GROCARY_ENV environment variable into webview
            let env = std::env::var("GROCARY_ENV").unwrap_or_else(|_| "dev".to_string());
            let window = app.get_webview_window("main").unwrap();

            // Inject environment variable as JavaScript
            let inject_script = format!(r#"window.__GROCARY_ENV__ = "{}";"#, env);
            let _ = window.eval(&inject_script);

            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_grocery_service,
            generate_keys,
            create_grocery_user,
            connect_kroger
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}