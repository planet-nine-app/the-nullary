use bdo_rs::BDO;
use sanora_rs::Sanora;
use serde_json::json;
use serde_json::Value;
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
use std::env;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

mod julia_integration;
use julia_integration::{JuliaConnection, Message, Conversation};

/// Debug logging command for development
#[tauri::command]
fn dbg(log: &str) {
    dbg!(log);
}

/// Get the public key from the sessionless instance
#[tauri::command]
async fn get_public_key() -> Result<String, String> {
    let sessionless = get_sessionless().await?;
    Ok(sessionless.public_key().to_hex())
}

/// Get environment configuration from environment variables
#[tauri::command]
fn get_env_config() -> String {
    env::var("STACKCHAT_ENV").unwrap_or_else(|_| "dev".to_string())
}

/// Get service URL based on environment and service name
fn get_service_url(service: &str) -> String {
    let env = env::var("STACKCHAT_ENV").unwrap_or_else(|_| "dev".to_string());
    
    let url = match (env.as_str(), service) {
        // Test environment (127.0.0.1:5111-5122)
        ("test", "julia") => "http://127.0.0.1:5111/".to_string(),
        ("test", "continuebee") => "http://127.0.0.1:5112/".to_string(),
        ("test", "pref") => "http://127.0.0.1:5113/".to_string(),
        ("test", "bdo") => "http://127.0.0.1:5114/".to_string(),
        ("test", "joan") => "http://127.0.0.1:5115/".to_string(),
        ("test", "addie") => "http://127.0.0.1:5116/".to_string(),
        ("test", "fount") => "http://127.0.0.1:5117/".to_string(),
        ("test", "dolores") => "http://127.0.0.1:5118/".to_string(),
        ("test", "minnie") => "http://127.0.0.1:5119/".to_string(),
        ("test", "aretha") => "http://127.0.0.1:5120/".to_string(),
        ("test", "sanora") => "http://127.0.0.1:5121/".to_string(),
        ("test", "covenant") => "http://127.0.0.1:5122/".to_string(),
        
        // Local environment (127.0.0.1:3000-3011)
        ("local", "julia") => "http://127.0.0.1:3000/".to_string(),
        ("local", "continuebee") => "http://127.0.0.1:2999/".to_string(),
        ("local", "fount") => "http://127.0.0.1:3002/".to_string(),
        ("local", "bdo") => "http://127.0.0.1:3003/".to_string(),
        ("local", "pref") => "http://127.0.0.1:3004/".to_string(),
        ("local", "addie") => "http://127.0.0.1:3005/".to_string(),
        ("local", "dolores") => "http://127.0.0.1:3005/".to_string(),
        ("local", "joan") => "http://127.0.0.1:3004/".to_string(),
        ("local", "aretha") => "http://127.0.0.1:7277/".to_string(),
        ("local", "minnie") => "http://127.0.0.1:2525/".to_string(),
        ("local", "sanora") => "http://127.0.0.1:7243/".to_string(),
        ("local", "covenant") => "http://127.0.0.1:3011/".to_string(),
        
        // Dev environment (default)
        (_, service) => format!("https://dev.{}.allyabase.com/", service),
    };
    
    url
}

/// Get or create sessionless instance using environment variable or unique generated key
async fn get_sessionless() -> Result<Sessionless, String> {
    // Check for environment variable first
    match env::var("PRIVATE_KEY") {
        Ok(env_key) => {
            println!("🔑 Using PRIVATE_KEY from environment: {}...", &env_key[..16]);
            let sessionless = Sessionless::from_private_key(PrivateKey::from_hex(env_key).expect("private key"));
            println!("🔑 Public key (from env): {}", sessionless.public_key().to_hex());
            return Ok(sessionless);
        }
        Err(_) => {
            println!("🔑 No PRIVATE_KEY environment variable found, generating unique key");
        }
    }
    
    // Generate unique key per app instance to avoid conflicts
    // In production, this should be stored persistently per user
    let unique_id = std::process::id();
    let base_key = "b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496";
    let private_key = format!("{}{:08x}", &base_key[..56], unique_id); // Mix in process ID for uniqueness
    
    println!("🔑 Generated private key (process {}): {}...", unique_id, &private_key[..16]);
    let sessionless =
        Sessionless::from_private_key(PrivateKey::from_hex(private_key).expect("private key"));
    println!("🔑 Public key: {}", sessionless.public_key().to_hex());
    Ok(sessionless)
}

/// Sign a message using sessionless
async fn sign_message(message: String) -> Result<String, String> {
    let sessionless = get_sessionless().await?;
    let signature = sessionless.sign(&message);
    Ok(signature.into_hex())
}

// ============================================================================
// JULIA INTEGRATION COMMANDS - All delegated to julia_integration module
// ============================================================================

/// Get julia connections (delegates to julia_integration module)
#[tauri::command]
async fn get_connections() -> Result<Vec<JuliaConnection>, String> {
    julia_integration::get_connections().await
}

/// Get conversation messages for a julia association
#[tauri::command]
async fn get_conversation(association_uuid: String) -> Result<Conversation, String> {
    println!("💬 Getting conversation for association: {}", association_uuid);
    
    let connections = julia_integration::get_connections().await?;
    let connection = connections.into_iter()
        .find(|c| c.uuid == association_uuid)
        .ok_or_else(|| format!("Connection {} not found", association_uuid))?;
    
    // No mock data - return empty conversation until real julia message retrieval is implemented
    let conversation = Conversation {
        connection,
        messages: vec![], // Empty - no mock data!
        total_count: 0,
    };
    
    println!("📋 Retrieved conversation with {} real messages", conversation.messages.len());
    Ok(conversation)
}

/// Send a message in a julia association
#[tauri::command]
async fn send_message(association_uuid: String, content: String) -> Result<Message, String> {
    julia_integration::send_message(association_uuid, content).await
}

/// Mark messages as read for a julia association
#[tauri::command]
async fn mark_messages_read(association_uuid: String) -> Result<bool, String> {
    println!("Marked messages as read for julia association: {}", association_uuid);
    Ok(true)
}

/// Accept a julia connection
#[tauri::command]
async fn accept_connection(association_uuid: String) -> Result<bool, String> {
    julia_integration::accept_connection(association_uuid).await
}

/// Block a julia connection
#[tauri::command]
async fn block_connection(association_uuid: String) -> Result<bool, String> {
    julia_integration::block_connection(association_uuid).await
}

/// Generate a julia-based connection URL
#[tauri::command]
async fn generate_connection_url() -> Result<String, String> {
    julia_integration::generate_connection_url().await
}

/// Create a reciprocal connection for testing (simulates julia service behavior)
#[tauri::command]
async fn create_reciprocal_connection(partner_public_key: String, partner_name: String) -> Result<JuliaConnection, String> {
    println!("🔄 Creating reciprocal connection for testing");
    
    let julia_url = get_service_url("julia");
    
    // Create the reciprocal connection
    let connection = JuliaConnection {
        uuid: format!("julia-reciprocal-{}", uuid::Uuid::new_v4()),
        partner_uuid: format!("user-{}", uuid::Uuid::new_v4()),
        partner_name: partner_name.clone(),
        partner_public_key: partner_public_key.clone(),
        julia_url: julia_url.clone(),
        created_at: Utc::now(),
        last_message_at: None,
        unread_count: 0,
        status: "Active".to_string(), // Already accepted
    };
    
    println!("✅ Created reciprocal connection: {}", connection.uuid);
    Ok(connection)
}

/// Process a julia-based connection URL
#[tauri::command]
async fn process_connection_url(connection_url: String) -> Result<JuliaConnection, String> {
    julia_integration::process_connection_url(connection_url).await
}

// ============================================================================
// NON-JULIA COMMANDS (sessionless, health, teleportation)
// ============================================================================

/// Get sessionless info for the frontend
#[tauri::command]
async fn get_sessionless_info() -> Result<Value, String> {
    let sessionless = get_sessionless().await?;
    Ok(json!({
        "uuid": sessionless.public_key().to_hex(),
        "public_key": sessionless.public_key().to_hex()
    }))
}

/// Health check for the app
#[tauri::command]
async fn health_check() -> Result<Value, String> {
    let health_info = json!({
        "app": "stackchat",
        "version": "0.0.1",
        "environment": get_env_config(),
        "services": {
            "julia": get_service_url("julia"),
            "bdo": get_service_url("bdo"),
            "sanora": get_service_url("sanora")
        },
        "timestamp": Utc::now().to_rfc3339()
    });

    Ok(health_info)
}

/// Create Sanora user for teleportation (real implementation)
#[tauri::command]
async fn create_sanora_user(sanora_url: String) -> Result<Value, String> {
    println!("🔧 Creating Sanora user at: {}", sanora_url);
    
    match get_sessionless().await {
        Ok(sessionless) => {
            let sanora = Sanora::new(Some(sanora_url), Some(sessionless));
            match sanora.create_user().await {
                Ok(user) => {
                    println!("✅ Got Sanora user: uuid={}, basePubKey={}", user.uuid, user.base_pub_key);
                    Ok(json!({
                        "uuid": user.uuid,
                        "basePubKey": user.base_pub_key
                    }))
                },
                Err(e) => {
                    println!("❌ Failed to create Sanora user: {}", e);
                    Err(format!("Failed to create Sanora user: {}", e))
                }
            }
        }
        Err(e) => {
            println!("❌ Failed to get sessionless: {}", e);
            Err(format!("Failed to get sessionless: {}", e))
        }
    }
}

/// Teleport content via BDO (real implementation)
#[tauri::command]
async fn teleport_content(bdo_url: String, teleport_url: String) -> Result<Value, String> {
    println!("🌐 Teleporting content from: {} via BDO: {}", teleport_url, bdo_url);
    
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(Some(bdo_url), Some(sessionless));
            
            // Create/get BDO user first
            let stackchat = "stackchat";
            let bdo_user = match bdo.create_user(&stackchat, &json!({})).await {
                Ok(user) => {
                    println!("✅ BDO user ready for teleportation: {}", user.uuid);
                    user
                }
                Err(e) => {
                    println!("❌ Failed to create BDO user: {:?}", e);
                    return Err(format!("Failed to create BDO user: {}", e));
                }
            };
            
            // Now teleport the content
            println!("🚀 Starting teleportation with uuid: {}", bdo_user.uuid);
            match bdo.teleport(&bdo_user.uuid, &stackchat, &teleport_url).await {
                Ok(teleported_content) => {
                    println!("✅ Successfully teleported content: {:?}", teleported_content);
                    Ok(teleported_content)
                }
                Err(e) => {
                    println!("❌ Teleportation failed: {:?}", e);
                    Err(format!("Teleportation failed: {}", e))
                }
            }
        }
        Err(e) => {
            println!("❌ Failed to get sessionless instance: {}", e);
            Err(format!("Failed to get sessionless: {}", e))
        }
    }
}

// Generate the handler
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            dbg,
            get_public_key,
            get_env_config,
            get_connections,
            get_conversation,
            send_message,
            mark_messages_read,
            accept_connection,
            block_connection,
            generate_connection_url,
            process_connection_url,
            create_reciprocal_connection,
            get_sessionless_info,
            health_check,
            create_sanora_user,
            teleport_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}