use bdo_rs::BDO;
use sanora_rs::Sanora;
use serde_json::json;
use serde_json::Value;
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
use std::env;
use std::sync::{Mutex, LazyLock};
use std::collections::HashMap;
// use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

// Global connection storage
static CONNECTIONS: LazyLock<Mutex<HashMap<String, JuliaConnection>>> = LazyLock::new(|| {
    Mutex::new(HashMap::new())
});

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

/// Get or create sessionless instance using environment variable or default key
async fn get_sessionless() -> Result<Sessionless, String> {
    let private_key = env::var("PRIVATE_KEY").unwrap_or_else(|_| {
        String::from("b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496")
    });
    let sessionless =
        Sessionless::from_private_key(PrivateKey::from_hex(private_key).expect("private key"));
    Ok(sessionless)
}

/// Sign a message using sessionless
async fn sign_message(message: String) -> Result<String, String> {
    let sessionless = get_sessionless().await?;
    let signature = sessionless.sign(&message);
    Ok(signature.into_hex())
}

// Data structures for julia-based connections
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JuliaConnection {
    pub uuid: String,
    pub partner_uuid: String,
    pub partner_name: String,
    pub partner_public_key: String,
    pub julia_url: String,
    pub created_at: DateTime<Utc>,
    pub last_message_at: Option<DateTime<Utc>>,
    pub unread_count: usize,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub uuid: String,
    pub sender_uuid: String,
    pub sender_name: String,
    pub recipient_uuid: String,
    pub content: String,
    pub timestamp: DateTime<Utc>,
    pub association_uuid: String,
    pub read: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Conversation {
    pub connection: JuliaConnection,
    pub messages: Vec<Message>,
    pub total_count: usize,
}

/// Get julia connections (real implementation)
#[tauri::command]
async fn get_connections() -> Result<Vec<JuliaConnection>, String> {
    println!("🔍 Getting real julia connections...");
    
    // Get connections from storage
    let connections_map = CONNECTIONS.lock().map_err(|e| format!("Failed to lock connections: {}", e))?;
    let connections: Vec<JuliaConnection> = connections_map.values().cloned().collect();
    
    println!("📋 Found {} julia connections", connections.len());
    for conn in &connections {
        println!("  - {} ({}): {}", conn.partner_name, conn.status, conn.uuid);
    }
    
    Ok(connections)
}

/// Get conversation messages for a julia association
#[tauri::command]
async fn get_conversation(association_uuid: String) -> Result<Conversation, String> {
    // Get connections to find the right one
    let connections = get_connections().await?;
    let connection = connections.into_iter()
        .find(|c| c.uuid == association_uuid)
        .ok_or_else(|| format!("Connection {} not found", association_uuid))?;
    
    // Create mock messages for this conversation
    let sessionless = get_sessionless().await?;
    let messages = vec![
        Message {
            uuid: "msg-1".to_string(),
            sender_uuid: "user-alice".to_string(),
            sender_name: "Alice Developer".to_string(),
            recipient_uuid: sessionless.public_key().to_hex().to_string(),
            content: "Hey! How's the StackChat development going? I heard you switched to julia!".to_string(),
            timestamp: Utc::now() - chrono::Duration::hours(2),
            association_uuid: association_uuid.clone(),
            read: false,
        },
        Message {
            uuid: "msg-2".to_string(),
            sender_uuid: sessionless.public_key().to_hex().to_string(),
            sender_name: "You".to_string(),
            recipient_uuid: "user-alice".to_string(),
            content: "Yes! Just replaced covenant with julia for P2P messaging. Much cleaner!".to_string(),
            timestamp: Utc::now() - chrono::Duration::hours(1),
            association_uuid: association_uuid.clone(),
            read: true,
        },
        Message {
            uuid: "msg-3".to_string(),
            sender_uuid: "user-alice".to_string(),
            sender_name: "Alice Developer".to_string(),
            recipient_uuid: sessionless.public_key().to_hex().to_string(),
            content: "That sounds awesome! Julia associations are perfect for P2P messaging.".to_string(),
            timestamp: Utc::now() - chrono::Duration::minutes(30),
            association_uuid: association_uuid.clone(),
            read: false,
        },
        Message {
            uuid: "msg-4".to_string(),
            sender_uuid: sessionless.public_key().to_hex().to_string(),
            sender_name: "You".to_string(),
            recipient_uuid: "user-alice".to_string(),
            content: "And the space-flight animation still works perfectly! 🚀".to_string(),
            timestamp: Utc::now() - chrono::Duration::minutes(15),
            association_uuid: association_uuid.clone(),
            read: true,
        },
    ];
    
    let conversation = Conversation {
        connection,
        messages,
        total_count: 4,
    };
    
    Ok(conversation)
}

/// Send a message in a julia association
#[tauri::command]
async fn send_message(association_uuid: String, content: String) -> Result<Message, String> {
    println!("📤 Sending message to julia association: {}", association_uuid);
    
    let sessionless = get_sessionless().await?;
    
    // Create new message
    let message = Message {
        uuid: format!("msg-{}", uuid::Uuid::new_v4()),
        sender_uuid: sessionless.public_key().to_hex().to_string(),
        sender_name: "You".to_string(),
        recipient_uuid: "partner-user".to_string(), // Would be from connection
        content: content.clone(),
        timestamp: Utc::now(),
        association_uuid: association_uuid.clone(),
        read: true,
    };
    
    // TODO: Send to real julia service when julia-rs client is available
    println!("✅ Message ready for julia service: {}", content);
    
    Ok(message)
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
    println!("Accepted julia association: {}", association_uuid);
    Ok(true)
}

/// Block a julia connection
#[tauri::command]
async fn block_connection(association_uuid: String) -> Result<bool, String> {
    println!("Blocked julia association: {}", association_uuid);
    Ok(true)
}

/// Generate a julia-based connection URL
#[tauri::command]
async fn generate_connection_url() -> Result<String, String> {
    let sessionless = get_sessionless().await?;
    let julia_url = get_service_url("julia");
    
    // Create connection info: timestamp|publicKey|name|juliaServerURL
    // Using | as delimiter to avoid conflicts with : in URLs
    let timestamp = Utc::now().timestamp();
    let name = "StackChat User"; // Could be made configurable
    let message = format!("{}|{}|{}|{}", timestamp, sessionless.public_key().to_hex(), name, julia_url);
    
    // Sign the message
    let signature = sign_message(message.clone()).await?;
    
    // Create URL with all needed info for julia association
    let connection_url = format!(
        "stackchat://connect?message={}&signature={}&publicKey={}&name={}&juliaUrl={}",
        urlencoding::encode(&message),
        urlencoding::encode(&signature),
        urlencoding::encode(&sessionless.public_key().to_hex()),
        urlencoding::encode(name),
        urlencoding::encode(&julia_url)
    );
    
    Ok(connection_url)
}

/// Process a julia-based connection URL
#[tauri::command]
async fn process_connection_url(connection_url: String) -> Result<JuliaConnection, String> {
    // Parse URL to extract connection parameters
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
    
    let message = query_params.get("message")
        .ok_or("Missing message parameter")?;
    let partner_name = query_params.get("name")
        .ok_or("Missing name parameter")?;
    let julia_url = query_params.get("juliaUrl")
        .ok_or("Missing juliaUrl parameter")?;
    let public_key_a = query_params.get("publicKey")
        .ok_or("Missing publicKey parameter")?;
    
    // Validate timestamp (check if not expired - 5 minute window)
    let message_parts: Vec<&str> = message.split('|').collect();
    if message_parts.len() != 4 {
        return Err(format!("Invalid message format - should be timestamp|publicKey|name|juliaUrl, got {} parts: {:?}", message_parts.len(), message_parts));
    }
    
    let timestamp: i64 = message_parts[0].parse()
        .map_err(|_| "Invalid timestamp in message")?;
    let current_timestamp = Utc::now().timestamp();
    
    if current_timestamp - timestamp > 300 { // 5 minutes expiration
        return Err("Connection URL has expired".to_string());
    }
    
    // Create julia association
    let connection = JuliaConnection {
        uuid: format!("julia-assoc-{}", uuid::Uuid::new_v4()),
        partner_uuid: format!("user-{}", uuid::Uuid::new_v4()),
        partner_name: partner_name.clone(),
        partner_public_key: public_key_a.clone(),
        julia_url: julia_url.clone(),
        created_at: Utc::now(),
        last_message_at: None,
        unread_count: 0,
        status: "Pending".to_string(), // Pending until partner accepts
    };
    
    println!("✅ Created julia association: {:?}", connection);
    
    // Store the connection
    {
        let mut connections_map = CONNECTIONS.lock().map_err(|e| format!("Failed to lock connections: {}", e))?;
        connections_map.insert(connection.uuid.clone(), connection.clone());
        println!("💾 Stored connection with UUID: {}", connection.uuid);
        println!("📊 Total connections in storage: {}", connections_map.len());
    }
    
    Ok(connection)
}

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
            get_sessionless_info,
            health_check,
            create_sanora_user,
            teleport_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}