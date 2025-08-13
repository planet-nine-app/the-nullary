use julia_rs::{Julia, JuliaUser};
use serde_json::json;
use sessionless::hex::{FromHex, IntoHex};
use sessionless::{PrivateKey, Sessionless};
use std::env;
use std::sync::{Mutex, LazyLock};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

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

// Global connection storage
static CONNECTIONS: LazyLock<Mutex<HashMap<String, JuliaConnection>>> = LazyLock::new(|| {
    Mutex::new(HashMap::new())
});

// Cache the julia user UUID
static JULIA_USER_UUID: LazyLock<Mutex<Option<String>>> = LazyLock::new(|| {
    Mutex::new(None)
});

/// Get service URL based on environment and service name
fn get_service_url(service: &str) -> String {
    let env = env::var("STACKCHAT_ENV").unwrap_or_else(|_| "dev".to_string());
    println!("🌍 Environment for {}: {}", service, env);
    
    let url = match (env.as_str(), service) {
        // Test environment (127.0.0.1:5111-5122)
        ("test", "julia") => "http://127.0.0.1:5111/".to_string(),
        
        // Local environment (127.0.0.1:3000-3011)
        ("local", "julia") => "http://127.0.0.1:3000/".to_string(),
        
        // Dev environment (default)
        (_, service) => format!("https://dev.{}.allyabase.com/", service),
    };
    
    println!("📍 Service URL for {} in {} env: {}", service, env, url);
    url
}

/// Create a Julia instance with our consistent sessionless keys
async fn create_julia_client() -> Result<Julia, String> {
    // Use the same sessionless instance logic as the main app
    let private_key = match env::var("PRIVATE_KEY") {
        Ok(env_key) => {
            println!("🔑 Julia client using PRIVATE_KEY from environment: {}...", &env_key[..16]);
            env_key
        }
        Err(_) => {
            println!("🔑 Julia client: No PRIVATE_KEY environment variable found, generating unique key");
            // Generate unique key per app instance to avoid conflicts
            let unique_id = std::process::id();
            let base_key = "b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496";
            format!("{}{:08x}", &base_key[..56], unique_id) // Mix in process ID for uniqueness
        }
    };
    
    let sessionless = Sessionless::from_private_key(PrivateKey::from_hex(private_key).expect("private key"));
    
    let julia_url = get_service_url("julia");
    println!("🔧 Creating julia client with URL: {}", julia_url);
    let mut julia = Julia::new(Some(julia_url.clone()));
    julia.sessionless = sessionless;
    println!("🔧 Julia client created with base_url: {}", julia_url);
    
    Ok(julia)
}

/// Update local connections from julia user data
fn update_connections_from_julia(julia_user: &JuliaUser) -> Result<(), String> {
    // Parse associations from julia user's keys
    if let Some(interacting_keys) = julia_user.keys.get("interactingKeys") {
        let mut connections_map = CONNECTIONS.lock().map_err(|e| format!("Failed to lock connections: {}", e))?;
        
        for (partner_uuid, partner_data) in interacting_keys {
            // Check if we already have this connection
            if !connections_map.values().any(|c| c.partner_uuid == *partner_uuid) {
                // Skip the "julia" connection - this is internal service metadata
                if partner_uuid == "julia" {
                    continue;
                }
                
                // Create connection from julia association
                let connection = JuliaConnection {
                    uuid: format!("julia-{}", partner_uuid),
                    partner_uuid: partner_uuid.clone(),
                    partner_name: "Julia User".to_string(), // Could be stored in julia metadata
                    partner_public_key: partner_data.clone(), // This is the partner's public key
                    julia_url: get_service_url("julia"),
                    created_at: Utc::now(),
                    last_message_at: None,
                    unread_count: 0,
                    status: "Active".to_string(),
                };
                
                connections_map.insert(connection.uuid.clone(), connection);
                println!("  📥 Loaded julia connection: {}", partner_uuid);
            }
        }
    }
    
    // Also check pending prompts for incoming connection requests
    for (prompt_id, prompt) in &julia_user.pending_prompts {
        println!("  📨 Found pending prompt: {} from {}", prompt_id, prompt.prompter);
    }
    
    Ok(())
}

/// Get or create julia user
pub async fn get_or_create_julia_user() -> Result<JuliaUser, String> {
    println!("🔍 Getting or creating julia user...");
    
    // Check if we already have a UUID cached
    let cached_uuid = {
        let uuid_cache = JULIA_USER_UUID.lock().map_err(|e| format!("Failed to lock UUID cache: {}", e))?;
        uuid_cache.clone()
    };
    
    let julia = create_julia_client().await?;
    
    if let Some(uuid) = cached_uuid {
        println!("🔍 Checking for existing julia user with UUID: {}", uuid);
        // Try to get existing user with our sessionless keys
        // The julia service expects the UUID to be the actual UUID, not the public key
        match julia.get_user(&uuid).await {
            Ok(julia_user) => {
                println!("✅ Retrieved existing julia user: {}", julia_user.uuid);
                update_connections_from_julia(&julia_user)?;
                return Ok(julia_user);
            }
            Err(e) => {
                let error_msg = format!("{}", e);
                println!("⚠️ Failed to get existing user: {}", error_msg);
                
                // Only clear the cache if it's a "not found" error
                // Keep the cache for parsing errors or network issues
                if error_msg.contains("not found") || error_msg.contains("404") {
                    println!("   User not found - clearing cache");
                    let mut uuid_cache = JULIA_USER_UUID.lock().map_err(|e| format!("Failed to lock UUID cache: {}", e))?;
                    *uuid_cache = None;
                } else {
                    println!("   Keeping cached UUID - might be temporary issue");
                    // For parsing errors, try to create user but don't cache a new UUID yet
                    // This prevents creating multiple users for the same person
                    return Err(format!("Julia service communication error: {}", error_msg));
                }
            }
        }
    }
    
    // Create new user
    println!("📝 Creating new julia user...");
    let pub_key = julia.sessionless.public_key().to_hex();
    let user = JuliaUser::new(pub_key.clone(), "StackChat User".to_string());
    
    match julia.create_user(user).await {
        Ok(julia_user) => {
            println!("✅ Julia user created with UUID: {}", julia_user.uuid);
            println!("   Public key: {}", julia_user.pub_key);
            
            // Cache the UUID for future use
            {
                let mut uuid_cache = JULIA_USER_UUID.lock().map_err(|e| format!("Failed to lock UUID cache: {}", e))?;
                *uuid_cache = Some(julia_user.uuid.clone());
                println!("💾 Cached julia UUID: {}", julia_user.uuid);
            }
            
            update_connections_from_julia(&julia_user)?;
            Ok(julia_user)
        }
        Err(e) => {
            println!("❌ Failed to create julia user: {}", e);
            Err(format!("Julia service error: {}", e))
        }
    }
}

/// Get julia connections (real implementation)
pub async fn get_connections() -> Result<Vec<JuliaConnection>, String> {
    println!("🔍 Getting real julia connections...");
    
    // Try to refresh from julia service first
    let _ = get_or_create_julia_user().await;
    
    // Get connections from storage
    let connections_map = CONNECTIONS.lock().map_err(|e| format!("Failed to lock connections: {}", e))?;
    let connections: Vec<JuliaConnection> = connections_map.values().cloned().collect();
    
    println!("📋 Found {} julia connections", connections.len());
    for conn in &connections {
        println!("  - {} ({}): {}", conn.partner_name, conn.status, conn.uuid);
    }
    
    Ok(connections)
}

/// Send a message in a julia association
pub async fn send_message(association_uuid: String, content: String) -> Result<Message, String> {
    println!("📤 Sending message to julia association: {}", association_uuid);
    
    // Get the connection to find the partner's UUID
    let connection = {
        let connections_map = CONNECTIONS.lock().map_err(|e| format!("Failed to lock connections: {}", e))?;
        connections_map.get(&association_uuid)
            .ok_or_else(|| format!("Connection {} not found", association_uuid))?
            .clone()
    };
    
    // Get our julia user
    let julia_user = get_or_create_julia_user().await?;
    
    // CRITICAL FIX: Check if partner_uuid is actually a UUID or a public key
    let receiver_uuid = if connection.partner_uuid.len() == 66 && connection.partner_uuid.starts_with("02") {
        // This is a public key, we need to find the actual UUID
        println!("⚠️ Partner UUID appears to be a public key: {}", connection.partner_uuid);
        println!("🔍 Searching julia interacting keys for real UUID...");
        
        // Look up the partner's UUID from our interacting keys
        if let Some(interacting_keys) = julia_user.keys.get("interactingKeys") {
            let mut found_uuid = None;
            for (uuid, stored_key) in interacting_keys {
                if stored_key == &connection.partner_public_key {
                    println!("🎯 Found partner's real UUID: {} for public key: {}", uuid, stored_key);
                    found_uuid = Some(uuid.clone());
                    break;
                }
            }
            
            if let Some(uuid) = found_uuid {
                uuid
            } else {
                return Err(format!("Partner UUID not found in julia associations. Partner may not be properly associated. Partner public key: {}", connection.partner_public_key));
            }
        } else {
            return Err("No interacting keys found - partner is not associated".to_string());
        }
    } else {
        // This looks like a proper UUID
        println!("✅ Using partner UUID: {}", connection.partner_uuid);
        connection.partner_uuid.clone()
    };
    
    // Send the message via julia service
    let julia = create_julia_client().await?;
    
    match julia.post_message(&julia_user.uuid, &receiver_uuid, content.clone()).await {
        Ok(result) => {
            println!("✅ Message sent via julia service: {}", content);
            println!("📊 Julia response: {:?}", result);
        }
        Err(e) => {
            println!("⚠️ Failed to send via julia: {}", e);
        }
    }
    
    // Create local message representation
    let message = Message {
        uuid: format!("msg-{}", uuid::Uuid::new_v4()),
        sender_uuid: julia_user.uuid,
        sender_name: "You".to_string(),
        recipient_uuid: connection.partner_uuid.clone(),
        content: content.clone(),
        timestamp: Utc::now(),
        association_uuid: association_uuid.clone(),
        read: true,
    };
    
    Ok(message)
}

/// Accept a julia connection
pub async fn accept_connection(association_uuid: String) -> Result<bool, String> {
    println!("🤝 Accepting julia association: {}", association_uuid);
    
    // Update connection status to "Active"
    {
        let mut connections_map = CONNECTIONS.lock().map_err(|e| format!("Failed to lock connections: {}", e))?;
        if let Some(connection) = connections_map.get_mut(&association_uuid) {
            connection.status = "Active".to_string();
            println!("✅ Connection {} status updated to Active", association_uuid);
            
            // In a real system, the julia service would notify the other party
            // For now, we just log that this would happen
            println!("📨 In production, julia service would notify partner at: {}", connection.partner_public_key);
            println!("   Partner would create their corresponding connection");
        } else {
            return Err(format!("Connection {} not found", association_uuid));
        }
    }
    
    Ok(true)
}

/// Block a julia connection
pub async fn block_connection(association_uuid: String) -> Result<bool, String> {
    println!("🚫 Blocking julia association: {}", association_uuid);
    
    // Update connection status to "Blocked"
    {
        let mut connections_map = CONNECTIONS.lock().map_err(|e| format!("Failed to lock connections: {}", e))?;
        if let Some(connection) = connections_map.get_mut(&association_uuid) {
            connection.status = "Blocked".to_string();
            println!("❌ Connection {} status updated to Blocked", association_uuid);
        } else {
            return Err(format!("Connection {} not found", association_uuid));
        }
    }
    
    Ok(true)
}

/// Process a julia-based connection URL
pub async fn process_connection_url(connection_url: String) -> Result<JuliaConnection, String> {
    println!("🔗 Processing julia connection URL: {}", connection_url);
    
    // Get our current user first to check for self-connection
    let julia_user = get_or_create_julia_user().await?;
    let our_public_key = julia_user.pub_key.clone();
    
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
    let _signature = query_params.get("signature")
        .ok_or("Missing signature parameter")?;
    let partner_julia_uuid = query_params.get("juliaUUID")
        .ok_or("Missing juliaUUID parameter")?;
    let prompt_id = query_params.get("promptId")
        .ok_or("Missing promptId parameter")?;
    let prompt_text = query_params.get("promptText")
        .ok_or("Missing promptText parameter")?;
    let new_timestamp = query_params.get("newTimestamp")
        .ok_or("Missing newTimestamp parameter")?;
    let new_signature = query_params.get("newSignature")
        .ok_or("Missing newSignature parameter")?;
    
    // Check for self-connection attempt
    if public_key_a == &our_public_key {
        return Err("❌ Cannot create connection to yourself! You're trying to connect to your own public key.".to_string());
    }
    
    println!("✅ Connection request valid: {} → {}", our_public_key, public_key_a);
    println!("✅ Partner julia UUID: {}", partner_julia_uuid);
    println!("✅ Prompt ID: {}", prompt_id);
    println!("✅ Partner's signed timestamp: {}", new_timestamp);
    
    // Validate timestamp (check if not expired - 5 minute window)
    let message_parts: Vec<&str> = message.split('|').collect();
    if message_parts.len() != 8 {
        return Err(format!("Invalid message format - should be timestamp|publicKey|name|juliaUrl|juliaUUID|promptId|newTimestamp|newSignature, got {} parts: {:?}", message_parts.len(), message_parts));
    }
    
    let timestamp: i64 = message_parts[0].parse()
        .map_err(|_| "Invalid timestamp in message")?;
    let current_timestamp = Utc::now().timestamp();
    
    if current_timestamp - timestamp > 300 { // 5 minutes expiration
        return Err("Connection URL has expired".to_string());
    }
    
    // Julia user already retrieved above for self-connection check
    
    // Create the julia association using the julia service
    let julia = create_julia_client().await?;
    
    // The partner (App 1) has already signed the prompt
    // We (App 2) just need to associate using their signed prompt data
    println!("📝 Using partner's signed prompt for association...");
    
    // Create the association prompt using the signed data from the URL
    let association_prompt = julia_rs::Prompt {
        timestamp: prompt_id.clone(), // Original prompt timestamp/ID
        prompter: partner_julia_uuid.clone(), // The partner who created the prompt
        prompt: Some(prompt_text.clone()),
        new_timestamp: Some(new_timestamp.clone()), // Partner's signed timestamp
        new_uuid: Some(partner_julia_uuid.clone()), // Partner's UUID who signed it
        new_pub_key: Some(public_key_a.clone()), // Partner's public key
        new_signature: Some(new_signature.clone()), // Partner's signature
    };
    
    println!("🔗 Associating with partner's signed prompt...");
    println!("   Partner UUID: {}", partner_julia_uuid);
    println!("   Partner Public Key: {}", public_key_a);
    println!("   Prompt: {}", prompt_text);
    
    // Associate using the partner's signed prompt
    // This should add the partner to our interacting keys
    let updated_user = julia.associate(&julia_user.uuid, &association_prompt).await
        .map_err(|e| format!("Failed to complete julia association: {}", e))?;
    
    println!("✅ Julia association completed successfully!");
    println!("📊 We now have {} associations", updated_user.keys.get("interactingKeys").map(|k| k.len()).unwrap_or(0));
    
    let partner_uuid = partner_julia_uuid.clone();
    
    // Create local connection representation with real partner UUID
    let connection = JuliaConnection {
        uuid: format!("julia-assoc-{}", uuid::Uuid::new_v4()),
        partner_uuid: partner_uuid, // Use real partner UUID from julia
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

/// Generate a julia-based connection URL
pub async fn generate_connection_url() -> Result<String, String> {
    println!("🔗 Generating julia connection URL...");
    
    // Get our julia user to include our UUID in the connection URL
    let julia_user = get_or_create_julia_user().await?;
    
    let julia = create_julia_client().await?;
    let julia_url = get_service_url("julia");
    
    // Step 1: Get a prompt from julia for association
    println!("📝 Getting association prompt from julia...");
    let prompt_user = julia.get_prompt(&julia_user.uuid).await
        .map_err(|e| format!("Failed to get julia prompt: {}", e))?;
    
    // The prompt should be in the pending_prompts
    let prompt_id = prompt_user.pending_prompts.keys().next()
        .ok_or("No prompt returned from julia")?;
    let prompt = prompt_user.pending_prompts.get(prompt_id)
        .ok_or("Prompt not found")?;
    
    println!("✅ Got prompt from julia: {}", prompt_id);
    println!("📝 Prompt details: {:?}", prompt);
    
    // Step 2: Sign the prompt ourselves (App 1)
    println!("✍️ Signing our own prompt...");
    let signed_result = julia.sign_prompt(&julia_user.uuid, &prompt).await
        .map_err(|e| format!("Failed to sign prompt: {}", e))?;
    println!("✅ Signed prompt successfully: {:?}", signed_result);
    
    // Now we need to prepare the signed prompt data for the connection URL
    // The second app will need: our UUID, our public key, the prompt text, and our signature
    let new_timestamp = chrono::Utc::now().timestamp_millis().to_string();
    let sign_message = format!("{}{}{}{}", 
        new_timestamp,
        julia_user.uuid.clone(),
        julia_user.pub_key.clone(),
        prompt.prompt.as_deref().unwrap_or("")
    );
    let new_signature = julia.sessionless.sign(&sign_message).into_hex();
    
    // Create connection info including all signed prompt details
    // Format: timestamp|publicKey|name|juliaServerURL|juliaUUID|promptId|newTimestamp|newSignature
    let timestamp = Utc::now().timestamp();
    let name = "StackChat User"; // Could be made configurable
    let public_key = julia.sessionless.public_key().to_hex();
    let julia_uuid = julia_user.uuid.clone();
    let message = format!("{}|{}|{}|{}|{}|{}|{}|{}", 
        timestamp, public_key, name, julia_url, julia_uuid, prompt_id, new_timestamp, new_signature);
    
    // Sign the entire connection message
    let signature = julia.sessionless.sign(&message).into_hex();
    
    // Create URL with all needed info for julia association including signed prompt
    let connection_url = format!(
        "stackchat://connect?message={}&signature={}&publicKey={}&name={}&juliaUrl={}&juliaUUID={}&promptId={}&promptText={}&newTimestamp={}&newSignature={}",
        urlencoding::encode(&message),
        urlencoding::encode(&signature),
        urlencoding::encode(&public_key),
        urlencoding::encode(name),
        urlencoding::encode(&julia_url),
        urlencoding::encode(&julia_uuid),
        urlencoding::encode(prompt_id),
        urlencoding::encode(prompt.prompt.as_deref().unwrap_or("StackChat Connection")),
        urlencoding::encode(&new_timestamp),
        urlencoding::encode(&new_signature)
    );
    
    // Also create a pending connection on the sender's side
    // This will be "Awaiting Response" until the other party accepts
    let outgoing_connection = JuliaConnection {
        uuid: format!("julia-outgoing-{}", uuid::Uuid::new_v4()),
        partner_uuid: "pending".to_string(), // Will be updated when partner accepts
        partner_name: "Awaiting Connection".to_string(),
        partner_public_key: "pending".to_string(),
        julia_url: julia_url.clone(),
        created_at: Utc::now(),
        last_message_at: None,
        unread_count: 0,
        status: "Outgoing".to_string(), // Special status for outgoing requests
    };
    
    // Store the outgoing connection
    {
        let mut connections_map = CONNECTIONS.lock().map_err(|e| format!("Failed to lock connections: {}", e))?;
        connections_map.insert(outgoing_connection.uuid.clone(), outgoing_connection.clone());
        println!("📤 Created outgoing connection request: {}", outgoing_connection.uuid);
        println!("📊 Total connections in storage: {}", connections_map.len());
    }
    
    println!("✅ Generated connection URL: {}", connection_url);
    Ok(connection_url)
}