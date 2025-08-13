use serde::{Deserialize, Serialize};
use sessionless::{PrivateKey, Sessionless};
use sessionless::hex::{FromHex, IntoHex};
use std::env;
use std::sync::{Mutex, LazyLock};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CovenantConnection {
    pub uuid: String,
    pub title: String,
    pub description: String,
    pub participants: Vec<String>,
    pub creator: String,
    pub status: String,
    pub created_at: String,
    pub progress: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContractStep {
    pub id: String,
    pub description: String,
    pub order: u32,
    pub completed: bool,
    pub signatures: HashMap<String, Option<StepSignature>>,
    pub created_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StepSignature {
    pub signature: String,
    pub timestamp: String,
    #[serde(rename = "pubKey")]
    pub pub_key: String,
    pub message: String,
    pub signed_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Contract {
    pub uuid: String,
    pub title: String,
    pub description: Option<String>,
    pub participants: Vec<String>,
    pub steps: Vec<ContractStep>,
    pub creator: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    #[serde(rename = "bdoLocation")]
    pub bdo_location: Option<String>,
}

// Global storage for user keys and contracts
static USER_UUID: LazyLock<Mutex<Option<String>>> = LazyLock::new(|| {
    Mutex::new(None)
});

static SESSIONLESS_INSTANCE: LazyLock<Mutex<Option<Sessionless>>> = LazyLock::new(|| {
    Mutex::new(None)
});

/// Get service URL based on environment
fn get_service_url(service: &str) -> String {
    let env = env::var("COVENANT_ENV").unwrap_or_else(|_| "dev".to_string());
    println!("🌍 Environment for {}: {}", service, env);
    
    let url = match (env.as_str(), service) {
        // Test environment (127.0.0.1:5111-5122)
        ("test", "covenant") => "http://127.0.0.1:5122".to_string(),
        
        // Local environment (127.0.0.1:3000-3011)
        ("local", "covenant") => "http://127.0.0.1:3011".to_string(),
        
        // Dev environment (default)
        (_, service) => format!("https://dev.{}.allyabase.com", service),
    };
    
    println!("📍 Service URL for {} in {} env: {}", service, env, url);
    url
}

/// Create a sessionless instance with unique keys per app instance
fn create_sessionless() -> Result<Sessionless, String> {
    let private_key = match env::var("PRIVATE_KEY") {
        Ok(env_key) => {
            println!("🔑 Using PRIVATE_KEY from environment: {}...", &env_key[..16]);
            env_key
        }
        Err(_) => {
            println!("🔑 No PRIVATE_KEY environment variable found, generating unique key");
            // Generate unique key per app instance to avoid conflicts
            let unique_id = std::process::id();
            let base_key = "c86012b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496";
            format!("{}{:08x}", &base_key[..56], unique_id) // Mix in process ID for uniqueness
        }
    };
    
    let sessionless = Sessionless::from_private_key(PrivateKey::from_hex(private_key).expect("private key"));
    Ok(sessionless)
}

/// Get or create sessionless instance
fn get_sessionless() -> Result<Sessionless, String> {
    let mut instance = SESSIONLESS_INSTANCE.lock().map_err(|e| format!("Failed to lock sessionless: {}", e))?;
    
    if instance.is_none() {
        *instance = Some(create_sessionless()?);
    }
    
    // We need to clone the data, not the reference, so recreate from private key
    let sessionless = instance.as_ref().unwrap();
    Ok(Sessionless::from_private_key(*sessionless.private_key()))
}

/// Get current timestamp as string
fn get_timestamp() -> String {
    chrono::Utc::now().timestamp_millis().to_string()
}

/// Create authenticated payload for covenant service
async fn create_auth_payload(contract_uuid: Option<&str>) -> Result<HashMap<String, String>, String> {
    let sessionless = get_sessionless()?;
    let timestamp = get_timestamp();
    let user_uuid = get_user_uuid().await?;
    let pub_key = sessionless.public_key().to_hex();
    
    let message = if let Some(uuid) = contract_uuid {
        format!("{}{}{}", timestamp, user_uuid, uuid)
    } else {
        format!("{}{}", timestamp, user_uuid)
    };
    
    let signature = sessionless.sign(&message).to_hex();
    
    let mut payload = HashMap::new();
    payload.insert("timestamp".to_string(), timestamp);
    payload.insert("userUUID".to_string(), user_uuid);
    payload.insert("pubKey".to_string(), pub_key);
    payload.insert("signature".to_string(), signature);
    
    Ok(payload)
}

/// Get user UUID (generate if needed)
async fn get_user_uuid() -> Result<String, String> {
    let mut uuid_cache = USER_UUID.lock().map_err(|e| format!("Failed to lock UUID cache: {}", e))?;
    
    if uuid_cache.is_none() {
        let uuid = sessionless::Sessionless::generate_uuid().to_string();
        *uuid_cache = Some(uuid.clone());
        println!("💾 Generated user UUID: {}", uuid);
    }
    
    Ok(uuid_cache.as_ref().unwrap().clone())
}

/// Create a new covenant contract
#[tauri::command]
async fn create_contract(
    title: String,
    description: String,
    participants: Vec<String>,
    steps: Vec<String>,
) -> Result<String, String> {
    println!("╔══════════════════════════════════════════════════════════════════════════════╗");
    println!("║ 📝 CREATING COVENANT CONTRACT                                               ║");
    println!("╠══════════════════════════════════════════════════════════════════════════════╣");
    println!("║ Title: {:<69} ║", title);
    println!("║ Description: {:<63} ║", description.chars().take(63).collect::<String>());
    println!("╠══════════════════════════════════════════════════════════════════════════════╣");
    println!("║ 👥 PARTICIPANTS ({} total):                                                  ║", participants.len());
    for (i, participant) in participants.iter().enumerate() {
        println!("║   {}. {:<70} ║", i + 1, participant);
    }
    println!("╠══════════════════════════════════════════════════════════════════════════════╣");
    println!("║ 📋 CONTRACT STEPS ({} total):                                                ║", steps.len());
    for (i, step) in steps.iter().enumerate() {
        println!("║   {}. {:<70} ║", i + 1, step.chars().take(70).collect::<String>());
    }
    println!("╚══════════════════════════════════════════════════════════════════════════════╝");
    
    let client = reqwest::Client::new();
    let covenant_url = get_service_url("covenant");
    let url = format!("{}/contract", covenant_url);
    
    let mut auth_payload = create_auth_payload(None).await?;
    
    // Add contract data
    auth_payload.insert("title".to_string(), title);
    auth_payload.insert("description".to_string(), description);
    
    // Convert steps to proper format
    let step_objects: Vec<serde_json::Value> = steps.into_iter().enumerate().map(|(i, desc)| {
        serde_json::json!({
            "description": desc,
            "order": i
        })
    }).collect();
    
    // Build complete request payload
    let mut request_payload = serde_json::json!(auth_payload);
    request_payload["participants"] = serde_json::json!(participants);
    request_payload["steps"] = serde_json::json!(step_objects);
    
    println!("🔧 Making request to: {}", url);
    println!("📦 Payload: {}", serde_json::to_string_pretty(&request_payload).unwrap_or_default());
    
    let response = client
        .post(&url)
        .json(&request_payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let status = response.status();
    let response_text = response.text().await.map_err(|e| format!("Failed to read response: {}", e))?;
    
    println!("📊 Response ({}): {}", status, response_text);
    
    if status.is_success() {
        // Parse response to get contract UUID
        if let Ok(response_data) = serde_json::from_str::<serde_json::Value>(&response_text) {
            if let Some(data) = response_data.get("data") {
                if let Some(uuid) = data.get("uuid").and_then(|u| u.as_str()) {
                    println!("✅ Created contract: {}", uuid);
                    return Ok(uuid.to_string());
                }
            }
        }
        
        // Fallback - try to extract UUID from response
        if response_text.contains("uuid") {
            println!("✅ Contract created successfully");
            return Ok("created".to_string());
        }
    }
    
    Err(format!("Failed to create contract ({}): {}", status, response_text))
}

/// Get user's contracts
#[tauri::command]
async fn get_contracts() -> Result<Vec<CovenantConnection>, String> {
    println!("🔍 Getting user contracts...");
    
    let client = reqwest::Client::new();
    let covenant_url = get_service_url("covenant");
    let url = format!("{}/contracts", covenant_url);
    
    println!("🔧 Making request to: {}", url);
    
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let status = response.status();
    let response_text = response.text().await.map_err(|e| format!("Failed to read response: {}", e))?;
    
    println!("📊 Response ({}): {}", status, response_text);
    
    if status.is_success() {
        // Try to parse contracts from response
        if let Ok(response_data) = serde_json::from_str::<serde_json::Value>(&response_text) {
            // Handle different response formats
            let contracts_array = if let Some(data) = response_data.get("data") {
                data.as_array()
            } else if response_data.is_array() {
                response_data.as_array()
            } else {
                None
            };
            
            if let Some(contracts) = contracts_array {
                let connections: Vec<CovenantConnection> = contracts.iter().filter_map(|contract| {
                    // Extract contract fields
                    let uuid = contract.get("uuid")?.as_str()?.to_string();
                    let title = contract.get("title")?.as_str()?.to_string();
                    let description = contract.get("description").and_then(|d| d.as_str()).unwrap_or("").to_string();
                    let participants = contract.get("participants")?
                        .as_array()?
                        .iter()
                        .filter_map(|p| p.as_str().map(|s| s.to_string()))
                        .collect();
                    let creator = contract.get("creator")?.as_str()?.to_string();
                    let status = contract.get("status")?.as_str()?.to_string();
                    let created_at = contract.get("created_at")?.as_str()?.to_string();
                    
                    // Calculate progress
                    let steps = contract.get("steps").and_then(|s| s.as_array())?;
                    let completed_steps = steps.iter().filter(|step| {
                        step.get("completed").and_then(|c| c.as_bool()).unwrap_or(false)
                    }).count();
                    let total_steps = steps.len();
                    let progress = if total_steps > 0 { 
                        (completed_steps as f32 / total_steps as f32) * 100.0 
                    } else { 
                        0.0 
                    };
                    
                    Some(CovenantConnection {
                        uuid,
                        title,
                        description,
                        participants,
                        creator,
                        status,
                        created_at,
                        progress,
                    })
                }).collect();
                
                println!("📋 Found {} contracts", connections.len());
                return Ok(connections);
            }
        }
    }
    
    // Return empty list if no contracts or parsing failed
    println!("📋 No contracts found or failed to parse response");
    Ok(vec![])
}

/// Get a specific contract
#[tauri::command]
async fn get_contract(contract_uuid: String) -> Result<Contract, String> {
    println!("🔍 Getting contract: {}", contract_uuid);
    
    let client = reqwest::Client::new();
    let covenant_url = get_service_url("covenant");
    let url = format!("{}/contract/{}", covenant_url, contract_uuid);
    
    println!("🔧 Making request to: {}", url);
    
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let status = response.status();
    let response_text = response.text().await.map_err(|e| format!("Failed to read response: {}", e))?;
    
    println!("📊 Response ({}): {}", status, response_text);
    
    if !status.is_success() {
        return Err(format!("Failed to get contract ({}): {}", status, response_text));
    }
    
    // Parse contract from response
    let contract: Contract = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse contract: {}", e))?;
    
    println!("📋 Retrieved contract: {}", contract.title);
    Ok(contract)
}

/// Sign a contract step
#[tauri::command]
async fn sign_step(contract_uuid: String, step_id: String) -> Result<bool, String> {
    println!("✍️ Signing step {} for contract {}", step_id, contract_uuid);
    
    let client = reqwest::Client::new();
    let covenant_url = get_service_url("covenant");
    let url = format!("{}/contract/{}/sign", covenant_url, contract_uuid);
    
    // Create auth payload for contract
    let mut auth_payload = create_auth_payload(Some(&contract_uuid)).await?;
    
    // Add step signing data
    auth_payload.insert("step_id".to_string(), step_id.clone());
    
    // Create step-specific signature
    let sessionless = get_sessionless()?;
    let timestamp = get_timestamp();
    let user_uuid = get_user_uuid().await?;
    let step_message = format!("{}{}{}{}", timestamp, user_uuid, contract_uuid, step_id);
    let step_signature = sessionless.sign(&step_message).to_hex();
    
    auth_payload.insert("step_signature".to_string(), step_signature);
    
    println!("🔧 Making request to: {}", url);
    println!("📦 Payload: {:?}", auth_payload);
    
    let response = client
        .put(&url)
        .json(&auth_payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let status = response.status();
    let response_text = response.text().await.map_err(|e| format!("Failed to read response: {}", e))?;
    
    println!("📊 Response ({}): {}", status, response_text);
    
    if status.is_success() {
        println!("✅ Step signed successfully");
        Ok(true)
    } else {
        Err(format!("Failed to sign step ({}): {}", status, response_text))
    }
}

/// Get contract SVG visualization
#[tauri::command]
async fn get_contract_svg(contract_uuid: String, theme: Option<String>) -> Result<String, String> {
    println!("🎨 Getting SVG for contract: {}", contract_uuid);
    
    let client = reqwest::Client::new();
    let covenant_url = get_service_url("covenant");
    let theme = theme.unwrap_or_else(|| "dark".to_string());
    let url = format!("{}/contract/{}/svg?theme={}", covenant_url, contract_uuid, theme);
    
    println!("🔧 Making request to: {}", url);
    
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let status = response.status();
    
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Failed to get SVG ({}): {}", status, error_text));
    }
    
    let svg = response.text().await.map_err(|e| format!("Failed to read SVG: {}", e))?;
    
    println!("🎨 Generated SVG visualization ({} chars)", svg.len());
    Ok(svg)
}

/// Get user UUID and public key for sharing
#[tauri::command]
async fn get_user_info() -> Result<(String, String), String> {
    let sessionless = get_sessionless()?;
    let pub_key = sessionless.public_key().to_hex();
    let user_uuid = get_user_uuid().await?;
    
    println!("╔══════════════════════════════════════════════════════════════════════════════╗");
    println!("║ 🔑 YOUR COVENANT USER INFORMATION                                           ║");
    println!("╠══════════════════════════════════════════════════════════════════════════════╣");
    println!("║ User UUID: {:<65} ║", user_uuid);
    println!("║ Public Key: {:<64} ║", pub_key);
    println!("╠══════════════════════════════════════════════════════════════════════════════╣");
    println!("║ 📋 PARTICIPANT MANAGEMENT TIPS:                                             ║");
    println!("║ • Copy your UUID from the app interface - it's automatically copied         ║");
    println!("║ • Share this UUID with others who want to add you to contracts              ║");
    println!("║ • Use the Connection screen to generate shareable URLs for easier sharing   ║");
    println!("║ • When creating contracts, paste participant UUIDs one per line             ║");
    println!("║ • Each participant must share their UUID with the contract creator          ║");
    println!("╚══════════════════════════════════════════════════════════════════════════════╝");
    
    Ok((user_uuid, pub_key))
}

/// Initialize sessionless and generate connection URL for other instances
#[tauri::command]
async fn generate_connection_url() -> Result<String, String> {
    let (user_uuid, pub_key) = get_user_info().await?;
    
    // Create a simple connection URL that other instances can use
    let connection_url = format!(
        "covenant://connect?userUUID={}&publicKey={}&name=Covenant User",
        urlencoding::encode(&user_uuid),
        urlencoding::encode(&pub_key)
    );
    
    println!("🔗 Generated connection URL: {}", connection_url);
    Ok(connection_url)
}

/// Process a connection URL from another instance
#[tauri::command]
async fn process_connection_url(connection_url: String) -> Result<String, String> {
    println!("🔗 Processing connection URL: {}", connection_url);
    
    // Parse URL to extract partner information
    let url_parts: Vec<&str> = connection_url.split('?').collect();
    if url_parts.len() != 2 {
        return Err("Invalid connection URL format".to_string());
    }
    
    let query_params: std::collections::HashMap<String, String> = url_parts[1]
        .split('&')
        .filter_map(|param| {
            let parts: Vec<&str> = param.split('=').collect();
            if parts.len() == 2 {
                Some((
                    parts[0].to_string(),
                    urlencoding::decode(parts[1]).unwrap_or_default().to_string()
                ))
            } else {
                None
            }
        })
        .collect();
    
    let partner_uuid = query_params.get("userUUID")
        .ok_or("Missing userUUID parameter")?;
    let partner_public_key = query_params.get("publicKey")
        .ok_or("Missing publicKey parameter")?;
    let partner_name = query_params.get("name")
        .map(|s| s.as_str())
        .unwrap_or("Unknown User");
    
    // Check for self-connection attempt
    let (_our_uuid, our_public_key) = get_user_info().await?;
    if partner_public_key == &our_public_key {
        return Err("❌ Cannot connect to yourself! You're trying to connect to your own public key.".to_string());
    }
    
    println!("✅ Connection request valid: {} → {}", our_public_key, partner_public_key);
    println!("✅ Partner: {} ({})", partner_name, partner_uuid);
    
    // Return success message with partner info
    Ok(format!("Connected to {} ({})", partner_name, partner_uuid))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            create_contract,
            get_contracts,
            get_contract,
            sign_step,
            get_contract_svg,
            get_user_info,
            generate_connection_url,
            process_connection_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}