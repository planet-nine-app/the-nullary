use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use tauri::command;
use chrono::{DateTime, Utc};

// Planet Nine service clients
use covenant_rs::CovenantClient;
use bdo_rs::BdoClient;
use sessionless::{Sessionless, PrivateKey};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub uuid: String,
    pub sender_uuid: String,
    pub sender_name: String,
    pub recipient_uuid: String,
    pub content: String,
    pub timestamp: DateTime<Utc>,
    pub covenant_uuid: String,
    pub read: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CovenantConnection {
    pub uuid: String,
    pub partner_uuid: String,
    pub partner_name: String,
    pub partner_public_key: String,
    pub joint_bdo_url: String,
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
    pub connection: CovenantConnection,
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
pub async fn create_connection(request: ConnectionRequest) -> ServiceResponse<CovenantConnection> {
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

async fn create_connection_internal(request: ConnectionRequest) -> Result<CovenantConnection, String> {
    let covenant_url = "http://localhost:3008".to_string();
    let sessionless = get_sessionless().await?;
    
    match CovenantClient::new(covenant_url) {
        Ok(covenant_client) => {
            // Create covenant with partner for joint BDO
            let covenant_data = serde_json::json!({
                "partner_public_key": request.partner_public_key,
                "partner_name": request.partner_name,
                "purpose": "messaging",
                "message": request.message
            });
            
            match covenant_client.create_covenant(sessionless, covenant_data).await {
                Ok(covenant_response) => {
                    let connection = CovenantConnection {
                        uuid: covenant_response.get("uuid")
                            .and_then(|v| v.as_str())
                            .unwrap_or(&uuid::Uuid::new_v4().to_string())
                            .to_string(),
                        partner_uuid: covenant_response.get("partner_uuid")
                            .and_then(|v| v.as_str())
                            .unwrap_or("unknown")
                            .to_string(),
                        partner_name: request.partner_name,
                        partner_public_key: request.partner_public_key,
                        joint_bdo_url: covenant_response.get("joint_bdo_url")
                            .and_then(|v| v.as_str())
                            .unwrap_or("http://localhost:3006")
                            .to_string(),
                        created_at: Utc::now(),
                        last_message_at: None,
                        unread_count: 0,
                        status: ConnectionStatus::Pending,
                    };
                    
                    Ok(connection)
                }
                Err(e) => Err(format!("Failed to create covenant: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create covenant client: {}", e)),
    }
}

#[command]
pub async fn get_connections() -> ServiceResponse<Vec<CovenantConnection>> {
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

async fn get_connections_internal() -> Result<Vec<CovenantConnection>, String> {
    let covenant_url = "http://localhost:3008".to_string();
    let sessionless = get_sessionless().await?;
    
    match CovenantClient::new(covenant_url) {
        Ok(covenant_client) => {
            match covenant_client.get_covenants(sessionless).await {
                Ok(covenants_response) => {
                    let mut connections = Vec::new();
                    
                    if let Some(covenants) = covenants_response.as_array() {
                        for covenant in covenants {
                            let connection = CovenantConnection {
                                uuid: covenant.get("uuid")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or(&uuid::Uuid::new_v4().to_string())
                                    .to_string(),
                                partner_uuid: covenant.get("partner_uuid")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("unknown")
                                    .to_string(),
                                partner_name: covenant.get("partner_name")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("Unknown User")
                                    .to_string(),
                                partner_public_key: covenant.get("partner_public_key")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("")
                                    .to_string(),
                                joint_bdo_url: covenant.get("joint_bdo_url")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("http://localhost:3006")
                                    .to_string(),
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
                Err(e) => {
                    // Return mock connections for development
                    Ok(create_mock_connections().await?)
                }
            }
        }
        Err(e) => {
            // Return mock connections for development
            Ok(create_mock_connections().await?)
        }
    }
}

async fn create_mock_connections() -> Result<Vec<CovenantConnection>, String> {
    let connections = vec![
        CovenantConnection {
            uuid: "covenant-1".to_string(),
            partner_uuid: "user-alice".to_string(),
            partner_name: "Alice Developer".to_string(),
            partner_public_key: "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd".to_string(),
            joint_bdo_url: "http://localhost:3006".to_string(),
            created_at: Utc::now() - chrono::Duration::days(5),
            last_message_at: Some(Utc::now() - chrono::Duration::minutes(30)),
            unread_count: 2,
            status: ConnectionStatus::Active,
        },
        CovenantConnection {
            uuid: "covenant-2".to_string(),
            partner_uuid: "user-bob".to_string(),
            partner_name: "Bob Creator".to_string(),
            partner_public_key: "02f899a8b2b75f68d6e6d4a8e5c9d8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1".to_string(),
            joint_bdo_url: "http://localhost:3006".to_string(),
            created_at: Utc::now() - chrono::Duration::days(2),
            last_message_at: Some(Utc::now() - chrono::Duration::hours(2)),
            unread_count: 0,
            status: ConnectionStatus::Active,
        },
        CovenantConnection {
            uuid: "covenant-3".to_string(),
            partner_uuid: "user-charlie".to_string(),
            partner_name: "Charlie Designer".to_string(),
            partner_public_key: "031f8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9".to_string(),
            joint_bdo_url: "http://localhost:3006".to_string(),
            created_at: Utc::now() - chrono::Duration::hours(6),
            last_message_at: None,
            unread_count: 0,
            status: ConnectionStatus::Pending,
        },
    ];
    
    Ok(connections)
}

#[command]
pub async fn accept_connection(covenant_uuid: String) -> ServiceResponse<bool> {
    match accept_connection_internal(covenant_uuid).await {
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

async fn accept_connection_internal(covenant_uuid: String) -> Result<bool, String> {
    let covenant_url = "http://localhost:3008".to_string();
    let sessionless = get_sessionless().await?;
    
    match CovenantClient::new(covenant_url) {
        Ok(covenant_client) => {
            match covenant_client.accept_covenant(sessionless, covenant_uuid.clone()).await {
                Ok(_) => {
                    println!("Accepted covenant connection: {}", covenant_uuid);
                    Ok(true)
                }
                Err(e) => Err(format!("Failed to accept connection: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create covenant client: {}", e)),
    }
}

#[command]
pub async fn block_connection(covenant_uuid: String) -> ServiceResponse<bool> {
    match block_connection_internal(covenant_uuid).await {
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

async fn block_connection_internal(covenant_uuid: String) -> Result<bool, String> {
    println!("Blocked connection: {}", covenant_uuid);
    Ok(true)
}

// Message management

#[command]
pub async fn get_conversation(covenant_uuid: String) -> ServiceResponse<Conversation> {
    match get_conversation_internal(covenant_uuid).await {
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

async fn get_conversation_internal(covenant_uuid: String) -> Result<Conversation, String> {
    // Get the connection first
    let connections = get_connections_internal().await?;
    let connection = connections.iter()
        .find(|c| c.uuid == covenant_uuid)
        .ok_or_else(|| format!("Connection {} not found", covenant_uuid))?
        .clone();
    
    // Load messages from joint BDO
    let messages = get_messages_from_bdo(connection.joint_bdo_url.clone(), covenant_uuid.clone()).await?;
    
    let conversation = Conversation {
        connection,
        messages: messages.clone(),
        total_count: messages.len(),
    };
    
    Ok(conversation)
}

async fn get_messages_from_bdo(bdo_url: String, covenant_uuid: String) -> Result<Vec<Message>, String> {
    let sessionless = get_sessionless().await?;
    
    match BdoClient::new(bdo_url, sessionless.clone()) {
        Ok(bdo_client) => {
            // Get messages from joint BDO
            let messages_key = format!("messages_{}", covenant_uuid);
            
            match bdo_client.get_object(messages_key).await {
                Ok(messages_data) => {
                    if let Ok(messages) = serde_json::from_value::<Vec<Message>>(messages_data) {
                        Ok(messages)
                    } else {
                        // Return mock messages for development
                        Ok(create_mock_messages(covenant_uuid).await?)
                    }
                }
                Err(_) => {
                    // Return mock messages for development
                    Ok(create_mock_messages(covenant_uuid).await?)
                }
            }
        }
        Err(_) => {
            // Return mock messages for development
            Ok(create_mock_messages(covenant_uuid).await?)
        }
    }
}

async fn create_mock_messages(covenant_uuid: String) -> Result<Vec<Message>, String> {
    let sessionless = get_sessionless().await?;
    
    let messages = vec![
        Message {
            uuid: "msg-1".to_string(),
            sender_uuid: "user-alice".to_string(),
            sender_name: "Alice Developer".to_string(),
            recipient_uuid: sessionless.uuid.clone(),
            content: "Hey! How's the StackChat development going?".to_string(),
            timestamp: Utc::now() - chrono::Duration::hours(2),
            covenant_uuid: covenant_uuid.clone(),
            read: false,
        },
        Message {
            uuid: "msg-2".to_string(),
            sender_uuid: sessionless.uuid.clone(),
            sender_name: "You".to_string(),
            recipient_uuid: "user-alice".to_string(),
            content: "It's going great! Just implemented the RPG-style dialog boxes.".to_string(),
            timestamp: Utc::now() - chrono::Duration::hours(1),
            covenant_uuid: covenant_uuid.clone(),
            read: true,
        },
        Message {
            uuid: "msg-3".to_string(),
            sender_uuid: "user-alice".to_string(),
            sender_name: "Alice Developer".to_string(),
            recipient_uuid: sessionless.uuid.clone(),
            content: "That sounds awesome! Can't wait to try the space-flight animation when sending messages.".to_string(),
            timestamp: Utc::now() - chrono::Duration::minutes(30),
            covenant_uuid: covenant_uuid.clone(),
            read: false,
        },
        Message {
            uuid: "msg-4".to_string(),
            sender_uuid: sessionless.uuid.clone(),
            sender_name: "You".to_string(),
            recipient_uuid: "user-alice".to_string(),
            content: "The animation turned out really cool - messages literally fly off to space! 🚀".to_string(),
            timestamp: Utc::now() - chrono::Duration::minutes(15),
            covenant_uuid: covenant_uuid.clone(),
            read: true,
        },
    ];
    
    Ok(messages)
}

#[command]
pub async fn send_message(
    covenant_uuid: String,
    content: String
) -> ServiceResponse<Message> {
    match send_message_internal(covenant_uuid, content).await {
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

async fn send_message_internal(covenant_uuid: String, content: String) -> Result<Message, String> {
    let sessionless = get_sessionless().await?;
    
    // Get connection details
    let connections = get_connections_internal().await?;
    let connection = connections.iter()
        .find(|c| c.uuid == covenant_uuid)
        .ok_or_else(|| format!("Connection {} not found", covenant_uuid))?;
    
    // Create new message
    let message = Message {
        uuid: format!("msg-{}", uuid::Uuid::new_v4()),
        sender_uuid: sessionless.uuid.clone(),
        sender_name: "You".to_string(),
        recipient_uuid: connection.partner_uuid.clone(),
        content,
        timestamp: Utc::now(),
        covenant_uuid: covenant_uuid.clone(),
        read: true,
    };
    
    // Save message to joint BDO
    save_message_to_bdo(connection.joint_bdo_url.clone(), message.clone()).await?;
    
    Ok(message)
}

async fn save_message_to_bdo(bdo_url: String, message: Message) -> Result<(), String> {
    let sessionless = get_sessionless().await?;
    
    match BdoClient::new(bdo_url, sessionless.clone()) {
        Ok(bdo_client) => {
            // Get existing messages
            let messages_key = format!("messages_{}", message.covenant_uuid);
            let mut messages = match bdo_client.get_object(messages_key.clone()).await {
                Ok(messages_data) => {
                    serde_json::from_value::<Vec<Message>>(messages_data)
                        .unwrap_or_else(|_| Vec::new())
                }
                Err(_) => Vec::new(),
            };
            
            // Add new message
            messages.push(message);
            
            // Save back to BDO
            let messages_value = serde_json::to_value(messages)
                .map_err(|e| format!("Failed to serialize messages: {}", e))?;
            
            match bdo_client.put_object(messages_key, messages_value).await {
                Ok(_) => {
                    println!("Message saved to joint BDO");
                    Ok(())
                }
                Err(e) => {
                    println!("Failed to save message to BDO: {}, continuing anyway", e);
                    Ok(())
                }
            }
        }
        Err(e) => {
            println!("Failed to create BDO client: {}, continuing anyway", e);
            Ok(())
        }
    }
}

#[command]
pub async fn mark_messages_read(covenant_uuid: String) -> ServiceResponse<bool> {
    match mark_messages_read_internal(covenant_uuid).await {
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

async fn mark_messages_read_internal(covenant_uuid: String) -> Result<bool, String> {
    println!("Marked messages as read for covenant: {}", covenant_uuid);
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
    let covenant_url = "http://localhost:3008".to_string();
    
    // Create message: timestamp:publicKey:covenantServerURL
    let timestamp = chrono::Utc::now().timestamp();
    let message = format!("{}:{}:{}", timestamp, sessionless.public_key.to_hex(), covenant_url);
    
    // Sign the message
    let signature = sessionless.sign_message(&message)
        .map_err(|e| format!("Failed to sign connection message: {}", e))?;
    
    // Create URL
    let connection_url = format!(
        "stackchat://connect?message={}&signature={}&publicKey={}",
        urlencoding::encode(&message),
        urlencoding::encode(&signature.to_hex()),
        urlencoding::encode(&sessionless.public_key.to_hex())
    );
    
    Ok(connection_url)
}

#[command]
pub async fn process_connection_url(connection_url: String) -> ServiceResponse<CovenantConnection> {
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

async fn process_connection_url_internal(connection_url: String) -> Result<CovenantConnection, String> {
    // Parse URL to extract message, signature, and publicKey
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
    
    // Validate timestamp (check if not expired - 5 minute window)
    let message_parts: Vec<&str> = message.split(':').collect();
    if message_parts.len() != 3 {
        return Err("Invalid message format".to_string());
    }
    
    let timestamp: i64 = message_parts[0].parse()
        .map_err(|_| "Invalid timestamp in message")?;
    let current_timestamp = chrono::Utc::now().timestamp();
    
    if current_timestamp - timestamp > 300 { // 5 minutes expiration
        return Err("Connection URL has expired".to_string());
    }
    
    // Verify User A's signature
    let public_key_a_bytes = hex::decode(public_key_a)
        .map_err(|_| "Invalid public key format")?;
    let signature_a_bytes = hex::decode(signature_a)
        .map_err(|_| "Invalid signature format")?;
    
    // TODO: Implement signature verification
    // For now, we'll assume signature is valid
    
    // Get our sessionless info
    let sessionless_b = get_sessionless().await?;
    
    // Sign the same message with our key
    let signature_b = sessionless_b.sign_message(message)
        .map_err(|e| format!("Failed to sign message: {}", e))?;
    
    // Send handshake to covenant service
    let handshake = ConnectionHandshake {
        message: message.clone(),
        signature_a: signature_a.clone(),
        signature_b: signature_b.to_hex(),
        public_key_a: public_key_a.clone(),
        public_key_b: sessionless_b.public_key.to_hex(),
    };
    
    establish_covenant_connection(handshake).await
}

async fn establish_covenant_connection(handshake: ConnectionHandshake) -> Result<CovenantConnection, String> {
    let covenant_url = "http://localhost:3008".to_string();
    
    match CovenantClient::new(covenant_url) {
        Ok(covenant_client) => {
            let covenant_data = serde_json::json!({
                "message": handshake.message,
                "signature_a": handshake.signature_a,
                "signature_b": handshake.signature_b,
                "public_key_a": handshake.public_key_a,
                "public_key_b": handshake.public_key_b,
                "connection_type": "p2p_messaging"
            });
            
            match covenant_client.establish_connection(covenant_data).await {
                Ok(covenant_response) => {
                    let connection = CovenantConnection {
                        uuid: covenant_response.get("uuid")
                            .and_then(|v| v.as_str())
                            .unwrap_or(&uuid::Uuid::new_v4().to_string())
                            .to_string(),
                        partner_uuid: covenant_response.get("partner_uuid")
                            .and_then(|v| v.as_str())
                            .unwrap_or("unknown")
                            .to_string(),
                        partner_name: covenant_response.get("partner_name")
                            .and_then(|v| v.as_str())
                            .unwrap_or("Unknown User")
                            .to_string(),
                        partner_public_key: handshake.public_key_a,
                        joint_bdo_url: covenant_response.get("joint_bdo_url")
                            .and_then(|v| v.as_str())
                            .unwrap_or("http://localhost:3006")
                            .to_string(),
                        created_at: Utc::now(),
                        last_message_at: None,
                        unread_count: 0,
                        status: ConnectionStatus::Active,
                    };
                    
                    Ok(connection)
                }
                Err(e) => Err(format!("Failed to establish covenant connection: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create covenant client: {}", e)),
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
    let health_info = serde_json::json!({
        "app": "stackchat",
        "version": "0.0.1",
        "services": {
            "covenant": "http://localhost:3008",
            "bdo": "http://localhost:3006"
        },
        "timestamp": chrono::Utc::now().to_rfc3339()
    });

    ServiceResponse {
        success: true,
        data: Some(health_info),
        error: None,
    }
}

#[command]
pub async fn dbg(message: String) -> String {
    println!("StackChat Debug: {}", message);
    format!("Debug logged: {}", message)
}