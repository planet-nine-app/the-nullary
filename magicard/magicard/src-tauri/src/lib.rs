use bdo_rs::structs::BDOUser;
use bdo_rs::BDO;
use serde_json::json;
use serde_json::Value;
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
use std::env;
use std::fs;
use std::path::Path;
use chrono;

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
    env::var("MAGICARD_ENV").unwrap_or_else(|_| "dev".to_string())
}

/// Get service URL based on environment and service name
fn get_service_url(service: &str) -> String {
    let env = env::var("MAGICARD_ENV").unwrap_or_else(|_| "dev".to_string());
    
    match (env.as_str(), service) {
        // Test environment (127.0.0.1:5111-5122)
        ("test", "bdo") => "http://127.0.0.1:5114/".to_string(),
        ("test", "sanora") => "http://127.0.0.1:5121/".to_string(),
        
        // Local environment
        ("local", "bdo") => "http://127.0.0.1:3003/".to_string(),
        ("local", "sanora") => "http://127.0.0.1:7243/".to_string(),
        
        // Dev environment (default)
        (_, service) => format!("https://dev.{}.allyabase.com/", service),
    }
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

/// Create a seed MagiStack for testing
#[tauri::command]
async fn create_seed_magistack() -> Result<String, String> {
    println!("🌱 Creating seed MagiStack for testing");
    
    // Read the actual test card SVG files
    let fire_svg = include_str!("../../../test-cards/fire-spell-card.svg");
    let ice_svg = include_str!("../../../test-cards/ice-spell-card.svg");
    let lightning_svg = include_str!("../../../test-cards/lightning-spell-card.svg");
    
    let seed_cards = json!([
        {
            "name": "Fire Spell",
            "type": "spell",
            "content": "Cast a powerful fireball spell with interactive navigation to other spells.",
            "svg": fire_svg
        },
        {
            "name": "Ice Spell", 
            "type": "spell",
            "content": "Freeze enemies with ice magic and spell component interactions.",
            "svg": ice_svg
        },
        {
            "name": "Lightning Spell",
            "type": "spell", 
            "content": "Strike with lightning speed and power, featuring chain lightning effects.",
            "svg": lightning_svg
        }
    ]);
    
    save_magistack("spell_test_stack", seed_cards).await
}

/// Create a new BDO user for card storage
#[tauri::command]
async fn create_bdo_user() -> Result<BDOUser, String> {
    let s = get_sessionless().await;
    let magicard = "magicard";
    
    let bdo_url = get_service_url("bdo");
    let env = env::var("MAGICARD_ENV").unwrap_or_else(|_| "dev".to_string());
    
    println!("🔗 Creating BDO user on: {} (env: {})", bdo_url, env);
    
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(
                Some(bdo_url),
                Some(sessionless),
            );
            let _user = bdo.create_user(&magicard, &json!({}), &false).await;
            dbg!(&_user);
            return match _user {
                Ok(user) => Ok(user),
                Err(_) => Err("no user".to_string()),
            };
        }
        Err(_) => Err("no user".to_string()),
    }
}

/// Save a MagiStack to local storage
#[tauri::command]
async fn save_magistack(name: &str, cards: Value) -> Result<String, String> {
    println!("💾 Saving MagiStack: {}", name);
    
    // Get app data directory - use home directory for cross-platform compatibility
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".magicard").join("stacks"),
        Err(_) => Path::new(".").join("magicard_data").join("stacks"),
    };
    
    // Create directory if it doesn't exist
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create directory: {}", e))?;
    
    // Save stack file
    let file_path = app_dir.join(format!("{}.json", name));
    let stack_data = json!({
        "name": name,
        "cards": cards,
        "created_at": chrono::Utc::now().to_rfc3339(),
        "updated_at": chrono::Utc::now().to_rfc3339()
    });
    
    fs::write(&file_path, serde_json::to_string_pretty(&stack_data).unwrap())
        .map_err(|e| format!("Failed to save stack: {}", e))?;
    
    println!("✅ Saved MagiStack to: {:?}", file_path);
    Ok(format!("Stack '{}' saved successfully", name))
}

/// Load a MagiStack from local storage
#[tauri::command]
async fn load_magistack(name: &str) -> Result<Value, String> {
    println!("📖 Loading MagiStack: {}", name);
    
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".magicard").join("stacks"),
        Err(_) => Path::new(".").join("magicard_data").join("stacks"),
    };
    
    let file_path = app_dir.join(format!("{}.json", name));
    
    if !file_path.exists() {
        return Err(format!("Stack '{}' not found", name));
    }
    
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read stack: {}", e))?;
    
    let stack_data: Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse stack data: {}", e))?;
    
    println!("✅ Loaded MagiStack: {}", name);
    Ok(stack_data)
}

/// List all available MagiStacks
#[tauri::command]
async fn list_magistacks() -> Result<Vec<Value>, String> {
    println!("📚 Listing all MagiStacks");
    
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".magicard").join("stacks"),
        Err(_) => Path::new(".").join("magicard_data").join("stacks"),
    };
    
    if !app_dir.exists() {
        return Ok(vec![]); // No stacks directory yet
    }
    
    let mut stacks = Vec::new();
    
    let entries = fs::read_dir(&app_dir)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();
        
        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
            let content = fs::read_to_string(&path)
                .map_err(|e| format!("Failed to read file: {}", e))?;
            
            let stack_data: Value = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse file: {}", e))?;
            
            stacks.push(stack_data);
        }
    }
    
    println!("✅ Found {} MagiStacks", stacks.len());
    Ok(stacks)
}

/// Delete a MagiStack
#[tauri::command]
async fn delete_magistack(name: &str) -> Result<String, String> {
    println!("🗑️ Deleting MagiStack: '{}'", name);
    
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".magicard").join("stacks"),
        Err(_) => Path::new(".").join("magicard_data").join("stacks"),
    };
    
    println!("📁 Looking for stack in directory: {:?}", app_dir);
    
    let file_path = app_dir.join(format!("{}.json", name));
    println!("📄 Target file path: {:?}", file_path);
    
    if !file_path.exists() {
        println!("❌ Stack file not found at: {:?}", file_path);
        return Err(format!("Stack '{}' not found at path: {:?}", name, file_path));
    }
    
    match fs::remove_file(&file_path) {
        Ok(()) => {
            println!("✅ Successfully deleted MagiStack file: {:?}", file_path);
            
            // Also try to delete associated card directory if it exists
            let cards_dir = match std::env::var("HOME") {
                Ok(home) => Path::new(&home).join(".magicard").join("cards").join(name),
                Err(_) => Path::new(".").join("magicard_data").join("cards").join(name),
            };
            
            if cards_dir.exists() {
                match fs::remove_dir_all(&cards_dir) {
                    Ok(()) => println!("✅ Also deleted associated cards directory: {:?}", cards_dir),
                    Err(e) => println!("⚠️ Could not delete cards directory (continuing anyway): {}", e),
                }
            }
            
            Ok(format!("Stack '{}' deleted successfully", name))
        }
        Err(e) => {
            println!("❌ Failed to delete file: {}", e);
            Err(format!("Failed to delete stack: {}", e))
        }
    }
}

/// Save SVG content for a card and post to BDO
#[tauri::command]
async fn save_card_svg(stack_name: &str, card_name: &str, svg_content: &str) -> Result<String, String> {
    println!("🎨 Saving SVG for card: {} in stack: {}", card_name, stack_name);
    
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".magicard").join("cards").join(stack_name),
        Err(_) => Path::new(".").join("magicard_data").join("cards").join(stack_name),
    };
    
    // Create directory if it doesn't exist
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create directory: {}", e))?;
    
    // Save SVG file locally
    let file_path = app_dir.join(format!("{}.svg", card_name));
    fs::write(&file_path, svg_content)
        .map_err(|e| format!("Failed to save SVG: {}", e))?;
    
    // Post card to BDO for navigation
    let bdo_pub_key = match post_card_to_bdo(stack_name, card_name, svg_content).await {
        Ok(pub_key) => {
            println!("✅ Posted card to BDO with pubKey: {}...", &pub_key[..12]);
            Some(pub_key)
        }
        Err(e) => {
            println!("⚠️ Failed to post to BDO (continuing anyway): {}", e);
            None
        }
    };
    
    println!("✅ Saved SVG to: {:?}", file_path);
    
    // Return both file path and BDO pubKey if available
    let result = json!({
        "filePath": file_path.to_string_lossy().to_string(),
        "bdoPubKey": bdo_pub_key
    });
    
    Ok(result.to_string())
}

/// Post a card to BDO for cross-card navigation
async fn post_card_to_bdo(stack_name: &str, card_name: &str, svg_content: &str) -> Result<String, String> {
    println!("🌐 Posting card to BDO: {} / {}", stack_name, card_name);
    
    let s = get_sessionless().await?;
    let magicard = "magicard";
    let bdo_url = get_service_url("bdo");
    
    let bdo = BDO::new(Some(bdo_url), Some(s));
    
    // Create BDO user for this card
    let bdo_user = match bdo.create_user(&magicard, &json!({}), &false).await {
        Ok(user) => user,
        Err(e) => return Err(format!("Failed to create BDO user: {}", e)),
    };
    
    println!("✅ Created BDO user: {}", bdo_user.uuid);
    
    // Create a unique card type identifier
    let card_type = format!("{}_{}", stack_name, card_name)
        .replace(" ", "_")
        .replace("/", "_")
        .replace("\\", "_")
        .to_lowercase();
    
    // Get our public key for the BDO object
    let sessionless_instance = get_sessionless().await?;
    let our_pub_key = sessionless_instance.public_key().to_hex();
    
    // Create card data with proper structure and pub: true
    let card_data = json!({
        "cardName": card_name,
        "cardType": card_type,
        "bdoPubKey": our_pub_key.clone(),
        "svgContent": svg_content,
        "pub": true,
        "createdAt": chrono::Utc::now().to_rfc3339(),
        "stackName": stack_name
    });
    
    // Update BDO with the card data using the proper public method
    match bdo.update_bdo(&bdo_user.uuid, &card_type, &card_data, &true).await {
        Ok(_) => {
            println!("✅ Successfully posted card to BDO with pubKey: {}...", &our_pub_key[..12]);
            Ok(our_pub_key)
        }
        Err(e) => {
            let error_msg = format!("Failed to post card to BDO: {}", e);
            println!("❌ {}", error_msg);
            Err(error_msg)
        }
    }
}

/// Load SVG content for a card (local fallback)
#[tauri::command]
async fn load_card_svg(stack_name: &str, card_name: &str) -> Result<String, String> {
    println!("🎨 Loading SVG for card: {} in stack: {}", card_name, stack_name);
    
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".magicard").join("cards").join(stack_name),
        Err(_) => Path::new(".").join("magicard_data").join("cards").join(stack_name),
    };
    
    let file_path = app_dir.join(format!("{}.svg", card_name));
    
    if !file_path.exists() {
        return Err(format!("Card SVG '{}' not found", card_name));
    }
    
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read SVG: {}", e))?;
    
    println!("✅ Loaded SVG for card: {}", card_name);
    Ok(content)
}

/// Get a card from BDO by public key (bdoPubKey)
#[tauri::command]
async fn get_card_from_bdo(bdo_pub_key: &str) -> Result<Value, String> {
    println!("🌐 Getting card from BDO using pubKey: {}...", &bdo_pub_key[..12]);
    
    let bdo_url = get_service_url("bdo");
    println!("🔗 Using BDO URL: {}", bdo_url);
    
    // Create sessionless instances for BDO access (we use our own key to access public data)
    let sessionless_for_bdo = get_sessionless().await?;
    let sessionless_for_manual = get_sessionless().await?;
    let bdo = BDO::new(Some(bdo_url.clone()), Some(sessionless_for_bdo));
    
    // Create or get our BDO user for making the request
    let context = "magicard_access";
    let _bdo_user = match bdo.create_user(&context, &json!({}), &false).await {
        Ok(user) => {
            println!("✅ Created/accessed BDO user: {}", user.uuid);
            user
        },
        Err(e) => {
            println!("❌ Failed to create BDO user: {:?}", e);
            return Err("Failed to create BDO user for card access".to_string());
        }
    };
    
    // Use BDO client to fetch card data using proper authentication
    println!("🔍 Using BDO client to fetch card data for pubKey: {}...", &bdo_pub_key[..12]);
    
    // Get the BDO data using the target pubKey as a query parameter
    // This will make authenticated request: /user/{our_uuid}/bdo?pubKey={target_pubKey}
    let our_bdo_user_uuid = _bdo_user.uuid.clone();
    let hash = "magicard_access"; // Use the same hash as we used for user creation
    
    match bdo.get_public_bdo(&our_bdo_user_uuid, hash, bdo_pub_key).await {
        Ok(bdo_user) => {
            println!("✅ Successfully retrieved card data from BDO via client");
            println!("📋 BDO User Response - UUID: {}", bdo_user.uuid);
            println!("📋 BDO User BDO Data: {}", serde_json::to_string_pretty(&bdo_user.bdo).unwrap_or_else(|_| "Could not serialize bdo data".to_string()));
            
            // Extract relevant card information from the BDO user's bdo field
            return Ok(json!({
                "success": true,
                "card": {
                    "data": bdo_user.bdo,
                    "uuid": bdo_user.uuid,
                    "pubKey": bdo_pub_key,
                    "source": "BDO_CLIENT"
                }
            }));
        },
        Err(e) => {
            let error_msg = format!("{}", e);
            println!("❌ BDO client request failed: {}", error_msg);
        }
    }
    
    // Fall back to manual HTTP request with proper authentication
    println!("🔄 Falling back to manual authenticated HTTP request...");
    
    // We need to construct the authenticated request manually
    // First get our BDO user info to get the UUID
    let our_bdo_user_uuid = _bdo_user.uuid.clone();
    
    // Create authenticated request with sessionless
    use sessionless::hex::IntoHex;
    use std::time::{SystemTime, UNIX_EPOCH};
    
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
        .to_string();
    
    let hash = format!("{}GET/user/{}/bdo", timestamp, our_bdo_user_uuid);
    let signature = sessionless_for_manual.sign(&hash).to_hex();
    let pub_key = sessionless_for_manual.public_key().to_hex();
    
    // Construct the authenticated BDO request URL
    let auth_url = format!(
        "{}/user/{}/bdo?pubKey={}&timestamp={}&signature={}&pubKey={}", 
        bdo_url.trim_end_matches('/'),
        our_bdo_user_uuid,
        bdo_pub_key,
        timestamp,
        signature,
        pub_key
    );
    
    println!("🌐 Making authenticated BDO request to: {}...", &auth_url[..80]);
    
    let client = reqwest::Client::new();
    match client.get(&auth_url).send().await {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<Value>().await {
                    Ok(bdo_data) => {
                        println!("✅ Successfully retrieved card data via authenticated HTTP");
                        println!("📋 BDO Response Structure: {}", serde_json::to_string_pretty(&bdo_data).unwrap_or_else(|_| "Could not serialize response".to_string()));
                        
                        return Ok(json!({
                            "success": true,
                            "card": {
                                "data": bdo_data,
                                "pubKey": bdo_pub_key,
                                "source": "BDO_AUTH_HTTP"
                            }
                        }));
                    },
                    Err(e) => {
                        println!("❌ Failed to parse authenticated BDO response as JSON: {}", e);
                    }
                }
            } else {
                println!("❌ Authenticated BDO HTTP request failed with status: {}", response.status());
                // Try to get the error response body
                if let Ok(error_text) = response.text().await {
                    println!("❌ BDO Error Response: {}", error_text);
                }
            }
        },
        Err(e) => {
            println!("❌ Authenticated BDO HTTP request failed: {}", e);
        }
    }
    
    // If all approaches fail, return failure response
    println!("🔄 All BDO access methods failed");
    Ok(json!({
        "success": false,
        "error": "Card not found in BDO using any method",
        "pubKey": bdo_pub_key,
        "attempted_methods": ["bdo_client_get_public_bdo", "manual_authenticated_http"],
        "bdo_url": bdo_url
    }))
}

/// Navigate to a card via BDO
#[tauri::command]
async fn navigate_to_card(base_url: &str, card_key: &str) -> Result<Value, String> {
    println!("🧭 Navigating to card: {} via base: {}", card_key, base_url);
    
    let s = get_sessionless().await?;
    let magicard = "magicard";
    
    // Use the provided base URL for BDO
    let bdo = BDO::new(Some(base_url.to_string()), Some(s));
    
    // Create or get BDO user
    let _bdo_user = match bdo.create_user(&magicard, &json!({}), &false).await {
        Ok(user) => user,
        Err(_) => return Err("Failed to create BDO user".to_string()),
    };
    
    // Navigate to card from base using HTTP-based approach (since get method is private)
    // For now, return placeholder data - this functionality can be implemented later
    println!("⚠️ BDO navigation placeholder - returning empty data");
    Ok(json!({
        "svg": "<svg><text x='50' y='50'>Navigation not yet implemented</text></svg>",
        "message": "BDO navigation not yet implemented",
        "base_url": base_url,
        "card_key": card_key
    }))
}

/// List all cards available in BDO
#[tauri::command]
async fn list_cards_in_bdo() -> Result<Vec<String>, String> {
    println!("📚 Listing all cards in BDO");
    
    let s = get_sessionless().await?;
    let magicard = "magicard";
    let bdo_url = get_service_url("bdo");
    
    let bdo = BDO::new(Some(bdo_url), Some(s));
    
    // Create or get BDO user
    let _bdo_user = match bdo.create_user(&magicard, &json!({}), &false).await {
        Ok(user) => user,
        Err(_) => return Err("Failed to create BDO user".to_string()),
    };
    
    // List all cards using HTTP-based approach (since list method is private)
    // For now, return empty list - this functionality can be implemented later
    println!("⚠️ BDO list placeholder - returning empty list");
    Ok(vec![])
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            dbg,
            get_public_key,
            get_env_config,
            create_seed_magistack,
            create_bdo_user,
            save_magistack,
            load_magistack,
            list_magistacks,
            delete_magistack,
            save_card_svg,
            load_card_svg,
            get_card_from_bdo,
            navigate_to_card,
            list_cards_in_bdo
        ])
        .setup(|_app| {
            println!("🪄 MagiCard backend is starting up...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}