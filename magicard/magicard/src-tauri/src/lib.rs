use bdo_rs::structs::BDOUser;
use bdo_rs::BDO;
use serde_json::json;
use serde_json::{Value, Map};
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
use std::env;
use std::fs;
use std::path::Path;
use chrono::{self, Utc};
use std::collections;
use rand;

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

/// Create a seed MagiStack for testing with real BDO upload
#[tauri::command]
async fn create_seed_magistack() -> Result<String, String> {
    println!("🌱 Creating seed MagiStack with real BDO integration");
    
    // Step 1: Generate unique keys for the 3 cards
    let card_keys = generate_card_keys("elemental_spells", 3).await?;
    println!("🔑 Generated {} keys for elemental spells", card_keys.len());
    
    // Read the actual test card SVG files  
    let fire_svg = include_str!("../../../test-cards/elemental-spells/fire-spell-card.svg");
    let ice_svg = include_str!("../../../test-cards/elemental-spells/ice-spell-card.svg");
    let lightning_svg = include_str!("../../../test-cards/elemental-spells/lightning-spell-card.svg");
    
    // Step 2: Update SVG files to use real BDO pubKeys instead of demo ones
    println!("🔑 Replacing demo keys with real keys:");
    println!("🔑   Fire card pubKey: {}", &card_keys[0]);
    println!("🔑   Ice card pubKey: {}", &card_keys[1]);
    println!("🔑   Lightning card pubKey: {}", &card_keys[2]);
    
    let fire_svg_updated = fire_svg
        .replace("demo_user_ice", &card_keys[1])
        .replace("demo_user_lightning", &card_keys[2]);
    
    let ice_svg_updated = ice_svg
        .replace("demo_user_fire", &card_keys[0])
        .replace("demo_user_lightning", &card_keys[2]);
        
    let lightning_svg_updated = lightning_svg
        .replace("demo_user_fire", &card_keys[0])
        .replace("demo_user_ice", &card_keys[1]);
    
    println!("🔄 Updated SVG files with real BDO pubKeys");
    println!("📏 Fire SVG length: {} chars", fire_svg_updated.len());
    println!("📏 Ice SVG length: {} chars", ice_svg_updated.len());
    println!("📏 Lightning SVG length: {} chars", lightning_svg_updated.len());
    
    // Step 3: Upload each card to BDO
    let cards = vec![
        ("Fire Spell", fire_svg_updated, &card_keys[0]),
        ("Ice Spell", ice_svg_updated, &card_keys[1]), 
        ("Lightning Spell", lightning_svg_updated, &card_keys[2])
    ];
    
    let mut uploaded_cards = Vec::new();
    
    for (card_name, svg_content, pub_key) in cards {
        println!("📤 Uploading card: {} with pubKey: {}...", card_name, &pub_key[..12]);
        
        match store_card_in_bdo(pub_key, card_name, &svg_content).await {
            Ok(result) => {
                println!("✅ Successfully uploaded card: {}", card_name);
                uploaded_cards.push(json!({
                    "name": card_name,
                    "type": "spell",
                    "content": format!("Interactive spell card with real BDO navigation"),
                    "svg": svg_content,
                    "bdoPubKey": pub_key,
                    "uploaded": true
                }));
            },
            Err(e) => {
                println!("❌ Failed to upload card {}: {}", card_name, e);
                // Still add to local stack but mark as not uploaded
                uploaded_cards.push(json!({
                    "name": card_name,
                    "type": "spell", 
                    "content": format!("Interactive spell card (BDO upload failed: {})", e),
                    "svg": svg_content,
                    "bdoPubKey": pub_key,
                    "uploaded": false
                }));
            }
        }
    }
    
    println!("✅ Created seed stack with {} cards", uploaded_cards.len());
    
    // Step 4: Save the stack locally
    save_magistack("elemental_spells_stack", Value::Array(uploaded_cards)).await
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

/// Generate unique keys for cards and save to JSON file  
#[tauri::command]
async fn generate_card_keys(stack_name: &str, card_count: usize) -> Result<Vec<String>, String> {
    println!("🔑 Generating {} unique keys for stack: {}", card_count, stack_name);
    
    let mut card_keys = Vec::new();
    let mut key_data = std::collections::HashMap::new();
    
    // Generate unique BDO users for each card
    for i in 0..card_count {
        println!("🔑 Generating key {} of {}", i + 1, card_count);
        
        // Create a unique sessionless instance for this card
        let unique_private_key = generate_unique_private_key();
        let sessionless = Sessionless::from_private_key(
            PrivateKey::from_hex(unique_private_key.clone()).map_err(|e| format!("Invalid private key: {}", e))?
        );
        
        // Get the public key
        let public_key = sessionless.public_key().to_hex();
        
        // Store the key pair
        key_data.insert(format!("card_{}", i), json!({
            "private_key": unique_private_key,
            "public_key": public_key,
            "index": i
        }));
        
        card_keys.push(public_key.clone());
        println!("✅ Generated key {}: {}", i + 1, &public_key[..12.min(public_key.len())]);
    }
    
    // Save to JSON file in magicard directory
    let safe_stack_name = stack_name.replace(|c: char| !c.is_alphanumeric() && c != '_' && c != '-', "_");
    let file_name = format!("{}Keys.json", safe_stack_name);
    
    // Save in app data directory
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join("Library").join("Application Support").join("magicard").join("card-keys"),
        Err(_) => Path::new(".").join("magicard_data").join("card-keys"),
    };
    
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create keys directory: {}", e))?;
    
    let file_path = app_dir.join(&file_name);
    let keys_json = json!({
        "stack_name": stack_name,
        "created_at": chrono::Utc::now().to_rfc3339(),
        "card_count": card_count,
        "keys": key_data
    });
    
    fs::write(&file_path, serde_json::to_string_pretty(&keys_json).unwrap())
        .map_err(|e| format!("Failed to save keys file: {}", e))?;
    
    println!("✅ Saved {} keys to: {:?}", card_count, file_path);
    
    Ok(card_keys)
}

/// Store an individual card in BDO with its own unique user
#[tauri::command]
async fn store_card_in_bdo(card_bdo_pub_key: &str, card_name: &str, svg_content: &str) -> Result<Value, String> {
    println!("🗄️ Storing card in BDO: {} with pubKey: {}...", card_name, &card_bdo_pub_key[..12]);
    
    // Load the private key for this card from the saved keys file
    let card_private_key = match load_card_private_key("elemental_spells", card_bdo_pub_key).await {
        Ok(private_key) => private_key,
        Err(e) => {
            println!("⚠️ Could not load private key for card {}: {}. Using generated key.", card_name, e);
            // Generate a unique private key as fallback
            generate_unique_private_key()
        }
    };
    
    let bdo_url = get_service_url("bdo");
    
    // Create a sessionless instance using the card's unique private key
    let sessionless = match PrivateKey::from_hex(&card_private_key) {
        Ok(private_key) => Sessionless::from_private_key(private_key),
        Err(e) => {
            println!("❌ Failed to create private key from hex: {}", e);
            return Err(format!("Invalid private key: {}", e));
        }
    };
    
    let bdo = BDO::new(Some(bdo_url), Some(sessionless));
    
    // Create a unique context for this card
    let card_context = format!("magicard_{}", card_name.replace(" ", "_").replace("/", "_"));
    
    // Create BDO user for this card
    let card_data = json!({
        "cardName": card_name,
        "cardType": "spell",
        "bdoPubKey": card_bdo_pub_key,
        "svgContent": svg_content,
        "pub": true,
        "createdAt": chrono::Utc::now().to_rfc3339(),
        "stackName": "elemental_spells"
    });
    
    println!("📋 Storing card in BDO:");
    println!("📋 Card Name: {}", card_name);
    println!("📋 Card PubKey: {}", card_bdo_pub_key);
    println!("📋 Context: {}", card_context);
    println!("📋 SVG Content Length: {} chars", svg_content.len());
    println!("📋 SVG Preview: {}", &svg_content[..100.min(svg_content.len())]);
    
    // Validate SVG content before storage
    if !svg_content.trim().starts_with("<svg") {
        println!("⚠️ Warning: SVG content doesn't start with <svg> tag");
        println!("📋 Actual start: {}", &svg_content[..50.min(svg_content.len())]);
    } else {
        println!("✅ SVG content validates correctly (starts with <svg>)");
    }

    // Create BDO user first
    let bdo_user = match bdo.create_user(&card_context, &card_data, &true).await {
        Ok(user) => {
            println!("✅ Created BDO user for card {} with UUID: {}", card_name, user.uuid);
            println!("🔑 Card can be retrieved using pubKey: {}", card_bdo_pub_key);
            user
        },
        Err(e) => {
            println!("❌ Failed to create BDO user for card {}: {:?}", card_name, e);
            return Err(format!("Failed to create BDO user: {}", e));
        }
    };
    
    println!("🌐 Card is now publicly accessible with pubKey: {}", card_bdo_pub_key);
    
    Ok(json!({
        "success": true,
        "uuid": bdo_user.uuid,
        "pubKey": card_bdo_pub_key,
        "context": card_context
    }))
}

/// Load the private key for a specific card from the saved keys file
async fn load_card_private_key(stack_name: &str, card_bdo_pub_key: &str) -> Result<String, String> {
    let safe_stack_name = stack_name.replace(|c: char| !c.is_alphanumeric() && c != '_' && c != '-', "_");
    let file_name = format!("{}Keys.json", safe_stack_name);
    
    // Get keys file path
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join("Library").join("Application Support").join("magicard").join("card-keys"),
        Err(_) => Path::new(".").join("magicard_data").join("card-keys"),
    };
    
    let file_path = app_dir.join(&file_name);
    
    // Check if file exists
    if !file_path.exists() {
        return Err(format!("Keys file not found: {:?}", file_path));
    }
    
    // Read and parse the keys file
    let keys_content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read keys file: {}", e))?;
    
    let keys_json: Value = serde_json::from_str(&keys_content)
        .map_err(|e| format!("Failed to parse keys JSON: {}", e))?;
    
    // Find the private key for this public key
    if let Some(keys) = keys_json["keys"].as_object() {
        for (_card_id, key_info) in keys {
            if let Some(pub_key) = key_info["public_key"].as_str() {
                if pub_key == card_bdo_pub_key {
                    if let Some(private_key) = key_info["private_key"].as_str() {
                        return Ok(private_key.to_string());
                    }
                }
            }
        }
    }
    
    Err(format!("Private key not found for pubKey: {}", card_bdo_pub_key))
}

/// Generate a unique private key for a card
fn generate_unique_private_key() -> String {
    use rand::RngCore;
    
    // Generate 32 random bytes for secp256k1 private key
    let mut rng = rand::thread_rng();
    let mut bytes = [0u8; 32];
    rng.fill_bytes(&mut bytes);
    
    // Convert to hex string
    let hex_key = bytes.iter().map(|b| format!("{:02x}", b)).collect::<String>();
    
    // Validate it's a proper secp256k1 key by testing with sessionless
    match PrivateKey::from_hex(&hex_key) {
        Ok(_) => hex_key,
        Err(_) => {
            // If invalid, generate another 32-byte key
            println!("⚠️ Generated key validation failed, regenerating");
            let mut rng = rand::thread_rng();
            let mut fallback_bytes = [0u8; 32];
            rng.fill_bytes(&mut fallback_bytes);
            fallback_bytes.iter().map(|b| format!("{:02x}", b)).collect::<String>()
        }
    }
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
            list_cards_in_bdo,
            generate_card_keys,
            store_card_in_bdo
        ])
        .setup(|_app| {
            println!("🪄 MagiCard backend is starting up...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}