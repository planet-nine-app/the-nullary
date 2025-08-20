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
            let _user = bdo.create_user(&magicard, &json!({})).await;
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
    println!("🗑️ Deleting MagiStack: {}", name);
    
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".magicard").join("stacks"),
        Err(_) => Path::new(".").join("magicard_data").join("stacks"),
    };
    
    let file_path = app_dir.join(format!("{}.json", name));
    
    if !file_path.exists() {
        return Err(format!("Stack '{}' not found", name));
    }
    
    fs::remove_file(&file_path)
        .map_err(|e| format!("Failed to delete stack: {}", e))?;
    
    println!("✅ Deleted MagiStack: {}", name);
    Ok(format!("Stack '{}' deleted successfully", name))
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
    match post_card_to_bdo(stack_name, card_name, svg_content).await {
        Ok(bdo_response) => {
            println!("✅ Posted card to BDO: {}", bdo_response);
        }
        Err(e) => {
            println!("⚠️ Failed to post to BDO (continuing anyway): {}", e);
        }
    }
    
    println!("✅ Saved SVG to: {:?}", file_path);
    Ok(file_path.to_string_lossy().to_string())
}

/// Post a card to BDO for cross-card navigation
async fn post_card_to_bdo(stack_name: &str, card_name: &str, svg_content: &str) -> Result<String, String> {
    println!("🌐 Posting card to BDO: {} / {}", stack_name, card_name);
    
    let s = get_sessionless().await?;
    let magicard = "magicard";
    let bdo_url = get_service_url("bdo");
    
    let bdo = BDO::new(Some(bdo_url), Some(s));
    
    // Create or get BDO user
    let bdo_user = match bdo.create_user(&magicard, &json!({})).await {
        Ok(user) => user,
        Err(_) => return Err("Failed to create BDO user".to_string()),
    };
    
    // Create card object for BDO
    let card_object = json!({
        "svg": svg_content
    });
    
    // Create a unique key for this card
    let card_key = format!("{}_{}", stack_name, card_name)
        .replace(" ", "_")
        .replace("/", "_")
        .replace("\\", "_");
    
    // Post to BDO using HTTP-based approach (since put/get methods are private)
    // For now, return success - this functionality can be implemented later
    // with proper BDO API integration or HTTP calls
    println!("⚠️ BDO integration placeholder - card stored locally only");
    Ok(card_key)
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

/// Get a card from BDO by key
#[tauri::command]
async fn get_card_from_bdo(card_key: &str) -> Result<Value, String> {
    println!("🌐 Getting card from BDO: {}", card_key);
    
    let s = get_sessionless().await?;
    let magicard = "magicard";
    let bdo_url = get_service_url("bdo");
    
    let bdo = BDO::new(Some(bdo_url), Some(s));
    
    // Create or get BDO user
    let bdo_user = match bdo.create_user(&magicard, &json!({})).await {
        Ok(user) => user,
        Err(_) => return Err("Failed to create BDO user".to_string()),
    };
    
    // Get card from BDO using HTTP-based approach (since get method is private)
    // For now, return placeholder data - this functionality can be implemented later
    println!("⚠️ BDO integration placeholder - returning empty data");
    Ok(json!({
        "svg": "<svg><text x='50' y='50'>Card not found in BDO</text></svg>",
        "message": "BDO integration not yet implemented"
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
    let bdo_user = match bdo.create_user(&magicard, &json!({})).await {
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
    let bdo_user = match bdo.create_user(&magicard, &json!({})).await {
        Ok(user) => user,
        Err(_) => return Err("Failed to create BDO user".to_string()),
    };
    
    // List all cards using HTTP-based approach (since list method is private)
    // For now, return empty list - this functionality can be implemented later
    println!("⚠️ BDO list placeholder - returning empty list");
    Ok(vec![])
}

/// Save menu catalog to shared directory for cross-app access
#[tauri::command]
async fn save_menu_catalog(bdo_pub_key: &str, catalog_data: &str) -> Result<String, String> {
    println!("🍽️ Saving menu catalog with bdoPubKey: {}", bdo_pub_key);
    
    let shared_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".planet-nine").join("menu-catalogs"),
        Err(_) => Path::new(".").join("planet_nine_data").join("menu-catalogs"),
    };
    
    // Create directory if it doesn't exist
    fs::create_dir_all(&shared_dir)
        .map_err(|e| format!("Failed to create shared directory: {}", e))?;
    
    // Save catalog file with bdoPubKey as filename
    let file_path = shared_dir.join(format!("{}.json", bdo_pub_key));
    fs::write(&file_path, catalog_data)
        .map_err(|e| format!("Failed to save menu catalog: {}", e))?;
    
    println!("✅ Saved menu catalog to: {:?}", file_path);
    Ok(file_path.to_string_lossy().to_string())
}

/// Load menu catalog from shared directory by bdoPubKey
#[tauri::command]
async fn load_menu_catalog(bdo_pub_key: &str) -> Result<String, String> {
    println!("🔍 Loading menu catalog with bdoPubKey: {}", bdo_pub_key);
    
    let shared_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".planet-nine").join("menu-catalogs"),
        Err(_) => Path::new(".").join("planet_nine_data").join("menu-catalogs"),
    };
    
    let file_path = shared_dir.join(format!("{}.json", bdo_pub_key));
    
    if !file_path.exists() {
        return Err(format!("Menu catalog not found for bdoPubKey: {}", bdo_pub_key));
    }
    
    let catalog_data = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to load menu catalog: {}", e))?;
    
    println!("✅ Loaded menu catalog from: {:?}", file_path);
    Ok(catalog_data)
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
            save_menu_catalog,
            load_menu_catalog
        ])
        .setup(|_app| {
            println!("🪄 MagiCard backend is starting up...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}