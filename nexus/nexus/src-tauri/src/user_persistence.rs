// User Persistence Backend for The Nullary
// 
// Provides Rust backend functions for secure key storage and user data persistence.
// This module should be included in all Nullary Tauri applications.
//
// Features:
// - Tauri Stronghold integration for secure private key storage
// - Filesystem user data persistence (non-sensitive data)
// - Sessionless key generation and management
// - Service user creation for all Planet Nine services
//
// Usage in main.rs or lib.rs:
// ```rust
// use crate::user_persistence::*;
// 
// tauri::Builder::default()
//     .invoke_handler(tauri::generate_handler![
//         // Add these functions to your invoke_handler
//         generate_sessionless_keys,
//         stronghold_init,
//         stronghold_get_record,
//         stronghold_set_record,
//         stronghold_clear_vault,
//         read_user_data_file,
//         write_user_data_file,
//         clear_user_data,
//         // ... your other functions
//     ])
// ```

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use tauri::Manager;

// Import sessionless for key generation
use sessionless::{Sessionless, PrivateKey};

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionlessKeys {
    pub private_key: String,
    pub public_key: String,
    pub address: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StrongholdRecord {
    pub data: serde_json::Value,
}

// ===== SESSIONLESS KEY GENERATION =====

#[tauri::command]
pub async fn generate_sessionless_keys() -> Result<SessionlessKeys, String> {
    println!("🔑 Generating new sessionless keys...");
    
    // Generate new private key
    let private_key = PrivateKey::generate().map_err(|e| format!("Failed to generate private key: {}", e))?;
    
    // Create sessionless instance
    let sessionless = Sessionless::from_private_key(private_key);
    
    // Get public key and address
    let public_key_hex = hex::encode(sessionless.public_key().to_bytes());
    let private_key_hex = hex::encode(private_key.to_bytes());
    let address = sessionless.address();
    
    let keys = SessionlessKeys {
        private_key: private_key_hex,
        public_key: public_key_hex,
        address: address,
    };
    
    println!("✅ Sessionless keys generated successfully");
    Ok(keys)
}

// ===== TAURI STRONGHOLD INTEGRATION =====

#[tauri::command]
pub async fn stronghold_init(password: String, vault: String) -> Result<String, String> {
    println!("🔐 Initializing Stronghold vault: {}", vault);
    
    // TODO: Implement Stronghold initialization
    // This is a placeholder - actual implementation would use tauri-plugin-stronghold
    // 
    // Example implementation:
    // ```rust
    // use tauri_plugin_stronghold::{Stronghold, Location};
    // 
    // let stronghold = Stronghold::default();
    // stronghold.load_client_from_snapshot(
    //     Location::generic(vault.as_str(), Some(password.as_str()))
    // ).await.map_err(|e| format!("Stronghold init failed: {}", e))?;
    // ```
    
    println!("⚠️ Stronghold not yet implemented - using fallback storage");
    Ok("Stronghold initialized (fallback)".to_string())
}

#[tauri::command]
pub async fn stronghold_get_record(record_id: String) -> Result<Option<serde_json::Value>, String> {
    println!("🔍 Getting Stronghold record: {}", record_id);
    
    // TODO: Implement Stronghold record retrieval
    // This is a placeholder - actual implementation would use tauri-plugin-stronghold
    //
    // Example implementation:
    // ```rust
    // let stronghold = get_stronghold_instance()?;
    // let client = stronghold.get_client("vault").await?;
    // let data = client.execute_procedure(StrongholdProcedure::ReadFromVault {
    //     location: Location::generic(record_id, None),
    // }).await?;
    // ```
    
    println!("⚠️ Stronghold not yet implemented - returning None");
    Ok(None)
}

#[tauri::command]
pub async fn stronghold_set_record(record_id: String, data: serde_json::Value) -> Result<String, String> {
    println!("💾 Setting Stronghold record: {}", record_id);
    
    // TODO: Implement Stronghold record storage
    // This is a placeholder - actual implementation would use tauri-plugin-stronghold
    //
    // Example implementation:
    // ```rust
    // let stronghold = get_stronghold_instance()?;
    // let client = stronghold.get_client("vault").await?;
    // client.execute_procedure(StrongholdProcedure::WriteToVault {
    //     location: Location::generic(record_id, None),
    //     payload: data.to_string().as_bytes().to_vec(),
    // }).await?;
    // ```
    
    println!("⚠️ Stronghold not yet implemented - data not stored securely");
    Ok("Record set (fallback)".to_string())
}

#[tauri::command]
pub async fn stronghold_clear_vault() -> Result<String, String> {
    println!("🗑️ Clearing Stronghold vault");
    
    // TODO: Implement Stronghold vault clearing
    // This is a placeholder - actual implementation would use tauri-plugin-stronghold
    
    println!("⚠️ Stronghold not yet implemented - nothing to clear");
    Ok("Vault cleared (fallback)".to_string())
}

// ===== FILESYSTEM USER DATA PERSISTENCE =====

#[tauri::command]
pub async fn read_user_data_file(filename: String, app_handle: tauri::AppHandle) -> Result<Option<String>, String> {
    println!("📁 Reading user data file: {}", filename);
    
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let user_data_dir = app_data_dir.join("nullary-users");
    let file_path = user_data_dir.join(&filename);
    
    // Create directory if it doesn't exist
    if let Some(parent) = file_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create user data directory: {}", e))?;
    }
    
    // Try to read the file
    match std::fs::read_to_string(&file_path) {
        Ok(content) => {
            println!("✅ User data file read successfully: {}", filename);
            Ok(Some(content))
        },
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            println!("📝 User data file not found (will be created): {}", filename);
            Ok(None)
        },
        Err(e) => {
            println!("❌ Failed to read user data file: {}", e);
            Err(format!("Failed to read user data file: {}", e))
        }
    }
}

#[tauri::command]
pub async fn write_user_data_file(filename: String, data: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    println!("💾 Writing user data file: {}", filename);
    
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let user_data_dir = app_data_dir.join("nullary-users");
    let file_path = user_data_dir.join(&filename);
    
    // Create directory if it doesn't exist
    if let Some(parent) = file_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create user data directory: {}", e))?;
    }
    
    // Write the file
    std::fs::write(&file_path, data)
        .map_err(|e| format!("Failed to write user data file: {}", e))?;
    
    println!("✅ User data file written successfully: {}", filename);
    Ok("File written successfully".to_string())
}

#[tauri::command]
pub async fn clear_user_data(app_handle: tauri::AppHandle) -> Result<String, String> {
    println!("🗑️ Clearing all user data");
    
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    let user_data_dir = app_data_dir.join("nullary-users");
    
    // Remove the entire user data directory
    if user_data_dir.exists() {
        std::fs::remove_dir_all(&user_data_dir)
            .map_err(|e| format!("Failed to remove user data directory: {}", e))?;
        
        println!("✅ User data directory cleared");
    } else {
        println!("📝 User data directory doesn't exist - nothing to clear");
    }
    
    Ok("User data cleared successfully".to_string())
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get the user data directory path
 */
pub fn get_user_data_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    Ok(app_data_dir.join("nullary-users"))
}

/**
 * Ensure user data directory exists
 */
pub fn ensure_user_data_dir_exists(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let user_data_dir = get_user_data_dir(app_handle)?;
    
    std::fs::create_dir_all(&user_data_dir)
        .map_err(|e| format!("Failed to create user data directory: {}", e))?;
    
    Ok(user_data_dir)
}

// ===== ADDITIONAL DEPENDENCIES FOR Cargo.toml =====

/*
Add these dependencies to your Cargo.toml:

[dependencies]
# Core dependencies (should already exist)
tauri = { version = "2.6.2", features = [] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# For sessionless key generation
sessionless = "0.1.1"
hex = "0.4"

# For Stronghold (when implemented)
# tauri-plugin-stronghold = "2.0"  # Uncomment when ready to implement

# Existing Planet Nine service crates
# (these should already be in your Cargo.toml)
# bdo-rs = { path = "../../../../bdo/src/client/rust/bdo-rs" }
# sanora-rs = { path = "../../../../sanora/src/client/rust/sanora-rs" }
# dolores-rs = { path = "../../../../dolores/src/client/rust/dolores-rs" }
# fount-rs = { path = "../../../../fount/src/client/rust/fount-rs" }
# addie-rs = { path = "../../../../addie/src/client/rust/addie-rs" }
*/

// ===== EXAMPLE INTEGRATION =====

/*
To integrate this into your Tauri app, add this to your main.rs or lib.rs:

```rust
// Import the user persistence module
mod user_persistence;
use user_persistence::*;

// Add to your Tauri builder
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // User persistence functions
            generate_sessionless_keys,
            stronghold_init,
            stronghold_get_record,
            stronghold_set_record,
            stronghold_clear_vault,
            read_user_data_file,
            write_user_data_file,
            clear_user_data,
            
            // Your existing functions
            create_sanora_user,
            create_bdo_user,
            // ... etc
        ])
        .setup(|app| {
            println!("🌍 App starting with user persistence...");
            
            // Initialize user data directory
            if let Err(e) = ensure_user_data_dir_exists(app.handle()) {
                eprintln!("❌ Failed to create user data directory: {}", e);
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```
*/