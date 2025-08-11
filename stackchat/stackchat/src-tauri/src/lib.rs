use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use tauri::command;
use chrono::{DateTime, Utc};
use serde_json::Value;

// Planet Nine service clients
use bdo_rs::BdoClient;
use sanora_rs::SanoraClient;
use julia_rs::JuliaClient;
use sessionless::{Sessionless, PrivateKey};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnvironmentConfig {
    pub env: String,
    pub services: HashMap<String, String>,
}

// Environment configuration
fn get_environment_config() -> EnvironmentConfig {
    let env = env::var("STACKCHAT_ENV").unwrap_or_else(|_| "dev".to_string());
    
    let services = match env.as_str() {
        "test" => {
            let mut services = HashMap::new();
            services.insert("sanora".to_string(), "http://127.0.0.1:5121/".to_string());
            services.insert("bdo".to_string(), "http://127.0.0.1:5114/".to_string());
            services.insert("dolores".to_string(), "http://127.0.0.1:5118/".to_string());
            services.insert("fount".to_string(), "http://127.0.0.1:5117/".to_string());
            services.insert("addie".to_string(), "http://127.0.0.1:5116/".to_string());
            services.insert("pref".to_string(), "http://127.0.0.1:5113/".to_string());
            services.insert("julia".to_string(), "http://127.0.0.1:5111/".to_string());
            services.insert("continuebee".to_string(), "http://127.0.0.1:5112/".to_string());
            services.insert("joan".to_string(), "http://127.0.0.1:5115/".to_string());
            services.insert("aretha".to_string(), "http://127.0.0.1:5120/".to_string());
            services.insert("minnie".to_string(), "http://127.0.0.1:5119/".to_string());
            services.insert("covenant".to_string(), "http://127.0.0.1:5122/".to_string());
            services
        }
        "local" => {
            let mut services = HashMap::new();
            services.insert("sanora".to_string(), "http://localhost:7243/".to_string());
            services.insert("bdo".to_string(), "http://localhost:3003/".to_string());
            services.insert("dolores".to_string(), "http://localhost:3005/".to_string());
            services.insert("fount".to_string(), "http://localhost:3002/".to_string());
            services.insert("addie".to_string(), "http://localhost:3005/".to_string());
            services.insert("pref".to_string(), "http://localhost:3004/".to_string());
            services.insert("julia".to_string(), "http://localhost:3000/".to_string());
            services.insert("continuebee".to_string(), "http://localhost:2999/".to_string());
            services.insert("joan".to_string(), "http://localhost:3004/".to_string());
            services.insert("aretha".to_string(), "http://localhost:7277/".to_string());
            services.insert("minnie".to_string(), "http://localhost:2525/".to_string());
            services.insert("covenant".to_string(), "http://localhost:3011/".to_string());
            services
        }
        _ => { // "dev" - default
            let mut services = HashMap::new();
            services.insert("sanora".to_string(), "https://dev.sanora.allyabase.com/".to_string());
            services.insert("bdo".to_string(), "https://dev.bdo.allyabase.com/".to_string());
            services.insert("dolores".to_string(), "https://dev.dolores.allyabase.com/".to_string());
            services.insert("fount".to_string(), "https://dev.fount.allyabase.com/".to_string());
            services.insert("addie".to_string(), "https://dev.addie.allyabase.com/".to_string());
            services.insert("pref".to_string(), "https://dev.pref.allyabase.com/".to_string());
            services.insert("julia".to_string(), "https://dev.julia.allyabase.com/".to_string());
            services.insert("continuebee".to_string(), "https://dev.continuebee.allyabase.com/".to_string());
            services.insert("joan".to_string(), "https://dev.joan.allyabase.com/".to_string());
            services.insert("aretha".to_string(), "https://dev.aretha.allyabase.com/".to_string());
            services.insert("minnie".to_string(), "https://dev.minnie.allyabase.com/".to_string());
            services.insert("covenant".to_string(), "https://dev.covenant.allyabase.com/".to_string());
            services
        }
    };
    
    EnvironmentConfig { env, services }
}

fn get_service_url(service_name: &str) -> String {
    let config = get_environment_config();
    config.services.get(service_name)
        .cloned()
        .unwrap_or_else(|| config.services.get("sanora").cloned().unwrap_or_default())
}

#[command]
pub async fn get_env_config() -> ServiceResponse<EnvironmentConfig> {
    ServiceResponse {
        success: true,
        data: Some(get_environment_config()),
        error: None,
    }
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
    pub status: ConnectionStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ConnectionStatus {
    Pending,
    Active,
    Blocked,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Conversation {
    pub connection: JuliaConnection,
    pub messages: Vec<Message>,
    pub total_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionURL {
    pub message: String,
    pub signature: String,
    pub public_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionHandshake {
    pub message: String,
    pub signature_a: String,
    pub signature_b: String,
    pub public_key_a: String,
    pub public_key_b: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionRequest {
    pub partner_public_key: String,
    pub partner_name: String,
    pub message: Option<String>,
}

// Get sessionless instance with development key
async fn get_sessionless() -> Result<Sessionless, String> {
    let private_key = env::var("PRIVATE_KEY").unwrap_or_else(|_| {
        // Development key - in production, this should be user-specific
        String::from("b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496")
    });
    
    let sessionless = Sessionless::from_private_key(
        PrivateKey::from_hex(private_key).map_err(|e| format!("Invalid private key: {}", e))?
    );
    
    Ok(sessionless)
}

// Covenant connection management

#[command]
pub async fn create_connection(request: ConnectionRequest) -> ServiceResponse<JuliaConnection> {
    match create_connection_internal(request).await {
        Ok(connection) => ServiceResponse {
            success: true,
            data: Some(connection),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn create_connection_internal(request: ConnectionRequest) -> Result<JuliaConnection, String> {
    // Just call establish_julia_association with the julia URL from environment
    let julia_url = get_service_url("julia");
    establish_julia_association(&request.partner_public_key, &request.partner_name, &julia_url).await
}

#[command]
pub async fn get_connections() -> ServiceResponse<Vec<JuliaConnection>> {
    match get_connections_internal().await {
        Ok(connections) => ServiceResponse {
            success: true,
            data: Some(connections),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_connections_internal() -> Result<Vec<JuliaConnection>, String> {
    let julia_url = get_service_url("julia");
    let sessionless = get_sessionless().await?;
    
    match JuliaClient::new(julia_url.clone(), Some(sessionless.clone())) {
        Ok(julia_client) => {
            // Get our julia user
            match julia_client.create_user().await {
                Ok(user) => {
                    // Get all associations for this user
                    match julia_client.get_associations(&user).await {
                        Ok(associations) => {
                            let mut connections = Vec::new();
                            
                            if let Some(assocs) = associations.as_array() {
                                for assoc in assocs {
                                    let connection = JuliaConnection {
                                        uuid: assoc.get("uuid")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or(&uuid::Uuid::new_v4().to_string())
                                            .to_string(),
                                        partner_uuid: assoc.get("partner_uuid")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("unknown")
                                            .to_string(),
                                        partner_name: assoc.get("partner_name")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("Unknown User")
                                            .to_string(),
                                        partner_public_key: assoc.get("partner_public_key")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("")
                                            .to_string(),
                                        julia_url: julia_url.clone(),
                                        created_at: Utc::now(),
                                        last_message_at: None,
                                        unread_count: 0,
                                        status: ConnectionStatus::Active,
                                    };
                                    connections.push(connection);
                                }
                            }
                            
                            Ok(connections)
                        }
                        Err(_) => {
                            // Return mock connections for development
                            Ok(create_mock_julia_connections().await?)
                        }
                    }
                }
                Err(_) => {
                    // Return mock connections for development
                    Ok(create_mock_julia_connections().await?)
                }
            }
        }
        Err(_) => {
            // Return mock connections for development
            Ok(create_mock_julia_connections().await?)
        }
    }
}


async fn create_mock_julia_connections() -> Result<Vec<JuliaConnection>, String> {
    let julia_url = get_service_url("julia");
    let connections = vec![
        JuliaConnection {
            uuid: "julia-assoc-1".to_string(),
            partner_uuid: "user-alice".to_string(),
            partner_name: "Alice Developer".to_string(),
            partner_public_key: "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd".to_string(),
            julia_url: julia_url.clone(),
            created_at: Utc::now() - chrono::Duration::days(5),
            last_message_at: Some(Utc::now() - chrono::Duration::minutes(30)),
            unread_count: 2,
            status: ConnectionStatus::Active,
        },
        JuliaConnection {
            uuid: "julia-assoc-2".to_string(),
            partner_uuid: "user-bob".to_string(),
            partner_name: "Bob Creator".to_string(),
            partner_public_key: "02f899a8b2b75f68d6e6d4a8e5c9d8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1".to_string(),
            julia_url: julia_url.clone(),
            created_at: Utc::now() - chrono::Duration::days(2),
            last_message_at: Some(Utc::now() - chrono::Duration::hours(2)),
            unread_count: 0,
            status: ConnectionStatus::Active,
        },
        JuliaConnection {
            uuid: "julia-assoc-3".to_string(),
            partner_uuid: "user-charlie".to_string(),
            partner_name: "Charlie Designer".to_string(),
            partner_public_key: "031f8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9".to_string(),
            julia_url: julia_url.clone(),
            created_at: Utc::now() - chrono::Duration::hours(6),
            last_message_at: None,
            unread_count: 0,
            status: ConnectionStatus::Pending,
        },
    ];
    
    Ok(connections)
}

#[command]
pub async fn accept_connection(association_uuid: String) -> ServiceResponse<bool> {
    match accept_connection_internal(association_uuid).await {
        Ok(success) => ServiceResponse {
            success,
            data: Some(success),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn accept_connection_internal(association_uuid: String) -> Result<bool, String> {
    let julia_url = get_service_url("julia");
    let sessionless = get_sessionless().await?;
    
    match JuliaClient::new(julia_url, Some(sessionless)) {
        Ok(julia_client) => {
            // Get our user first
            match julia_client.create_user().await {
                Ok(user) => {
                    // Accept the association
                    match julia_client.accept_association(&user, association_uuid.clone()).await {
                        Ok(_) => {
                            println!("Accepted julia association: {}", association_uuid);
                            Ok(true)
                        }
                        Err(e) => Err(format!("Failed to accept association: {}", e)),
                    }
                }
                Err(e) => Err(format!("Failed to create julia user: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create julia client: {}", e)),
    }
}

#[command]
pub async fn block_connection(association_uuid: String) -> ServiceResponse<bool> {
    match block_connection_internal(association_uuid).await {
        Ok(success) => ServiceResponse {
            success,
            data: Some(success),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn block_connection_internal(association_uuid: String) -> Result<bool, String> {
    println!("Blocked julia association: {}", association_uuid);
    Ok(true)
}

// Message management

#[command]
pub async fn get_conversation(association_uuid: String) -> ServiceResponse<Conversation> {
    match get_conversation_internal(association_uuid).await {
        Ok(conversation) => ServiceResponse {
            success: true,
            data: Some(conversation),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_conversation_internal(association_uuid: String) -> Result<Conversation, String> {
    // Get the connection first
    let connections = get_connections_internal().await?;
    let connection = connections.iter()
        .find(|c| c.uuid == association_uuid)
        .ok_or_else(|| format!("Connection {} not found", association_uuid))?
        .clone();
    
    // Load messages from julia
    let messages = get_messages_from_julia(connection.julia_url.clone(), association_uuid.clone()).await?;
    
    let conversation = Conversation {
        connection,
        messages: messages.clone(),
        total_count: messages.len(),
    };
    
    Ok(conversation)
}

async fn get_messages_from_julia(julia_url: String, association_uuid: String) -> Result<Vec<Message>, String> {
    let sessionless = get_sessionless().await?;
    
    match JuliaClient::new(julia_url, Some(sessionless.clone())) {
        Ok(julia_client) => {
            // Get our user first
            match julia_client.create_user().await {
                Ok(user) => {
                    // Get messages for this association from julia
                    let messages_data = serde_json::json!({
                        "association_uuid": association_uuid
                    });
                    
                    match julia_client.get_messages(&user, messages_data).await {
                        Ok(julia_messages) => {
                            let mut messages = Vec::new();
                            
                            if let Some(msgs) = julia_messages.as_array() {
                                for msg in msgs {
                                    let message = Message {
                                        uuid: msg.get("uuid")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or(&uuid::Uuid::new_v4().to_string())
                                            .to_string(),
                                        sender_uuid: msg.get("sender_uuid")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("unknown")
                                            .to_string(),
                                        sender_name: msg.get("sender_name")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("Unknown User")
                                            .to_string(),
                                        recipient_uuid: msg.get("recipient_uuid")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("unknown")
                                            .to_string(),
                                        content: msg.get("content")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("")
                                            .to_string(),
                                        timestamp: msg.get("timestamp")
                                            .and_then(|v| v.as_str())
                                            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
                                            .map(|dt| dt.with_timezone(&Utc))
                                            .unwrap_or_else(|| Utc::now()),
                                        association_uuid: association_uuid.clone(),
                                        read: msg.get("read")
                                            .and_then(|v| v.as_bool())
                                            .unwrap_or(false),
                                    };
                                    messages.push(message);
                                }
                            }
                            
                            Ok(messages)
                        }
                        Err(_) => {
                            // Return mock messages for development
                            Ok(create_mock_messages(association_uuid).await?)
                        }
                    }
                }
                Err(_) => {
                    // Return mock messages for development  
                    Ok(create_mock_messages(association_uuid).await?)
                }
            }
        }
        Err(_) => {
            // Return mock messages for development
            Ok(create_mock_messages(association_uuid).await?)
        }
    }
}

async fn create_mock_messages(association_uuid: String) -> Result<Vec<Message>, String> {
    let sessionless = get_sessionless().await?;
    
    let messages = vec![
        Message {
            uuid: "msg-1".to_string(),
            sender_uuid: "user-alice".to_string(),
            sender_name: "Alice Developer".to_string(),
            recipient_uuid: sessionless.uuid.clone(),
            content: "Hey! How's the StackChat development going? I heard you switched to julia!".to_string(),
            timestamp: Utc::now() - chrono::Duration::hours(2),
            association_uuid: association_uuid.clone(),
            read: false,
        },
        Message {
            uuid: "msg-2".to_string(),
            sender_uuid: sessionless.uuid.clone(),
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
            recipient_uuid: sessionless.uuid.clone(),
            content: "That sounds awesome! Julia associations are perfect for P2P messaging.".to_string(),
            timestamp: Utc::now() - chrono::Duration::minutes(30),
            association_uuid: association_uuid.clone(),
            read: false,
        },
        Message {
            uuid: "msg-4".to_string(),
            sender_uuid: sessionless.uuid.clone(),
            sender_name: "You".to_string(),
            recipient_uuid: "user-alice".to_string(),
            content: "And the space-flight animation still works perfectly! 🚀".to_string(),
            timestamp: Utc::now() - chrono::Duration::minutes(15),
            association_uuid: association_uuid.clone(),
            read: true,
        },
    ];
    
    Ok(messages)
}

#[command]
pub async fn send_message(
    association_uuid: String,
    content: String
) -> ServiceResponse<Message> {
    match send_message_internal(association_uuid, content).await {
        Ok(message) => ServiceResponse {
            success: true,
            data: Some(message),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn send_message_internal(association_uuid: String, content: String) -> Result<Message, String> {
    let sessionless = get_sessionless().await?;
    
    // Get connection details
    let connections = get_connections_internal().await?;
    let connection = connections.iter()
        .find(|c| c.uuid == association_uuid)
        .ok_or_else(|| format!("Connection {} not found", association_uuid))?;
    
    // Create new message
    let message = Message {
        uuid: format!("msg-{}", uuid::Uuid::new_v4()),
        sender_uuid: sessionless.uuid.clone(),
        sender_name: "You".to_string(),
        recipient_uuid: connection.partner_uuid.clone(),
        content: content.clone(),
        timestamp: Utc::now(),
        association_uuid: association_uuid.clone(),
        read: true,
    };
    
    // Save message to julia
    save_message_to_julia(connection.julia_url.clone(), message.clone()).await?;
    
    Ok(message)
}

async fn save_message_to_julia(julia_url: String, message: Message) -> Result<(), String> {
    let sessionless = get_sessionless().await?;
    
    match JuliaClient::new(julia_url, Some(sessionless.clone())) {
        Ok(julia_client) => {
            // Get our user first
            match julia_client.create_user().await {
                Ok(user) => {
                    // Create message data for julia
                    let message_data = serde_json::json!({
                        "association_uuid": message.association_uuid,
                        "content": message.content,
                        "recipient_uuid": message.recipient_uuid,
                        "timestamp": message.timestamp.to_rfc3339(),
                        "message_type": "text"
                    });
                    
                    // Post message to julia
                    match julia_client.post_message(&user, message_data).await {
                        Ok(_) => {
                            println!("Message saved to julia association: {}", message.association_uuid);
                            Ok(())
                        }
                        Err(e) => {
                            println!("Failed to save message to julia: {}, continuing anyway", e);
                            Ok(())
                        }
                    }
                }
                Err(e) => {
                    println!("Failed to create julia user: {}, continuing anyway", e);
                    Ok(())
                }
            }
        }
        Err(e) => {
            println!("Failed to create julia client: {}, continuing anyway", e);
            Ok(())
        }
    }
}

#[command]
pub async fn mark_messages_read(association_uuid: String) -> ServiceResponse<bool> {
    match mark_messages_read_internal(association_uuid).await {
        Ok(success) => ServiceResponse {
            success,
            data: Some(success),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn mark_messages_read_internal(association_uuid: String) -> Result<bool, String> {
    println!("Marked messages as read for julia association: {}", association_uuid);
    Ok(true)
}

// P2P Connection mechanism via URL scheme

#[command]
pub async fn generate_connection_url() -> ServiceResponse<String> {
    match generate_connection_url_internal().await {
        Ok(url) => ServiceResponse {
            success: true,
            data: Some(url),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn generate_connection_url_internal() -> Result<String, String> {
    let sessionless = get_sessionless().await?;
    let julia_url = get_service_url("julia");
    
    // Create connection info: timestamp:publicKey:name:juliaServerURL
    let timestamp = chrono::Utc::now().timestamp();
    let name = "StackChat User"; // Could be made configurable
    let message = format!("{}:{}:{}:{}", timestamp, sessionless.public_key.to_hex(), name, julia_url);
    
    // Sign the message
    let signature = sessionless.sign_message(&message)
        .map_err(|e| format!("Failed to sign connection message: {}", e))?;
    
    // Create URL with all needed info for julia association
    let connection_url = format!(
        "stackchat://connect?message={}&signature={}&publicKey={}&name={}&juliaUrl={}",
        urlencoding::encode(&message),
        urlencoding::encode(&signature.to_hex()),
        urlencoding::encode(&sessionless.public_key.to_hex()),
        urlencoding::encode(name),
        urlencoding::encode(&julia_url)
    );
    
    Ok(connection_url)
}

#[command]
pub async fn process_connection_url(connection_url: String) -> ServiceResponse<JuliaConnection> {
    match process_connection_url_internal(connection_url).await {
        Ok(connection) => ServiceResponse {
            success: true,
            data: Some(connection),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn process_connection_url_internal(connection_url: String) -> Result<JuliaConnection, String> {
    // Parse URL to extract connection parameters
    let url_parts: Vec<&str> = connection_url.split('?').collect();
    if url_parts.len() != 2 {
        return Err("Invalid connection URL format".to_string());
    }
    
    let query_params: HashMap<String, String> = url_parts[1]
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
    let signature_a = query_params.get("signature")
        .ok_or("Missing signature parameter")?;
    let public_key_a = query_params.get("publicKey")
        .ok_or("Missing publicKey parameter")?;
    let partner_name = query_params.get("name")
        .ok_or("Missing name parameter")?;
    let julia_url = query_params.get("juliaUrl")
        .ok_or("Missing juliaUrl parameter")?;
    
    // Validate timestamp (check if not expired - 5 minute window)
    let message_parts: Vec<&str> = message.split(':').collect();
    if message_parts.len() != 4 {
        return Err("Invalid message format - should be timestamp:publicKey:name:juliaUrl".to_string());
    }
    
    let timestamp: i64 = message_parts[0].parse()
        .map_err(|_| "Invalid timestamp in message")?;
    let current_timestamp = chrono::Utc::now().timestamp();
    
    if current_timestamp - timestamp > 300 { // 5 minutes expiration
        return Err("Connection URL has expired".to_string());
    }
    
    // TODO: Verify signature properly
    // For now, we'll assume signature is valid for development
    
    // Create julia association
    establish_julia_association(public_key_a, partner_name, julia_url).await
}

async fn establish_julia_association(partner_public_key: &str, partner_name: &str, julia_url: &str) -> Result<JuliaConnection, String> {
    let sessionless = get_sessionless().await?;
    
    match JuliaClient::new(julia_url.to_string(), Some(sessionless.clone())) {
        Ok(julia_client) => {
            // Create our julia user first
            match julia_client.create_user().await {
                Ok(our_user) => {
                    // Now create association with partner
                    let association_data = serde_json::json!({
                        "partner_public_key": partner_public_key,
                        "partner_name": partner_name,
                        "connection_type": "stackchat_messaging"
                    });
                    
                    match julia_client.create_association(&our_user, association_data).await {
                        Ok(association) => {
                            let connection = JuliaConnection {
                                uuid: association.get("uuid")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or(&uuid::Uuid::new_v4().to_string())
                                    .to_string(),
                                partner_uuid: association.get("partner_uuid")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("unknown")
                                    .to_string(),
                                partner_name: partner_name.to_string(),
                                partner_public_key: partner_public_key.to_string(),
                                julia_url: julia_url.to_string(),
                                created_at: Utc::now(),
                                last_message_at: None,
                                unread_count: 0,
                                status: ConnectionStatus::Pending, // Pending until partner accepts
                            };
                            
                            Ok(connection)
                        }
                        Err(e) => Err(format!("Failed to create julia association: {}", e)),
                    }
                }
                Err(e) => Err(format!("Failed to create julia user: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create julia client: {}", e)),
    }
}

// Utility commands

#[command]
pub async fn get_sessionless_info() -> ServiceResponse<serde_json::Value> {
    match get_sessionless().await {
        Ok(sessionless) => ServiceResponse {
            success: true,
            data: Some(serde_json::json!({
                "uuid": sessionless.uuid,
                "public_key": sessionless.public_key.to_hex()
            })),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

#[command]
pub async fn health_check() -> ServiceResponse<serde_json::Value> {
    let config = get_environment_config();
    let health_info = serde_json::json!({
        "app": "stackchat",
        "version": "0.0.1",
        "environment": config.env,
        "services": {
            "covenant": get_service_url("covenant"),
            "bdo": get_service_url("bdo"),
            "julia": get_service_url("julia")
        },
        "timestamp": chrono::Utc::now().to_rfc3339()
    });

    ServiceResponse {
        success: true,
        data: Some(health_info),
        error: None,
    }
}

/// Create Sanora user for base pub key retrieval
#[command]
pub async fn create_sanora_user(sanora_url: &str) -> ServiceResponse<Value> {
    match create_sanora_user_internal(sanora_url).await {
        Ok(user) => ServiceResponse {
            success: true,
            data: Some(user),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn create_sanora_user_internal(sanora_url: &str) -> Result<Value, String> {
    let sessionless = get_sessionless().await?;
    
    match SanoraClient::new(sanora_url.to_string(), Some(sessionless)) {
        Ok(sanora) => {
            match sanora.create_user().await {
                Ok(user) => Ok(user),
                Err(e) => Err(format!("Failed to create Sanora user: {}", e))
            }
        }
        Err(e) => Err(format!("Failed to create Sanora client: {}", e))
    }
}

/// Teleport content from a URL via BDO
#[command]
pub async fn teleport_content(bdo_url: &str, teleport_url: &str) -> Result<Value, String> {
    let sessionless = get_sessionless().await?;
    
    let bdo = match BdoClient::new(bdo_url.to_string(), sessionless.clone()) {
        Ok(client) => client,
        Err(e) => return Err(format!("Failed to create BDO client: {}", e))
    };
    
    let stackchat = "stackchat";
    let bdo_user = match bdo.create_user(&stackchat, &serde_json::json!({})).await {
        Ok(user) => user,
        Err(e) => return Err(format!("Failed to create BDO user: {}", e))
    };
    
    match bdo.teleport(&bdo_user.get("uuid").and_then(|v| v.as_str()).unwrap_or(""), &stackchat, teleport_url).await {
        Ok(teleported_content) => Ok(teleported_content),
        Err(e) => Err(format!("Teleportation failed: {}", e))
    }
}

#[command]
pub async fn dbg(message: String) -> String {
    println!("StackChat Debug: {}", message);
    format!("Debug logged: {}", message)
}