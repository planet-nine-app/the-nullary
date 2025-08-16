use std::env;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use sessionless::{Sessionless, hex::IntoHex};
use prof_rs::ProfClient;
use serde_json::json;
use serde_json::Value;

// Profile data structure matching Prof service expectations
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProfileData {
    pub name: String,
    pub email: String,
    pub idothis: Option<String>, // The "I do this" field specific to IDothis
    pub bio: Option<String>,
    pub website: Option<String>,
    pub location: Option<String>,
    #[serde(flatten)]
    pub additional_fields: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Profile {
    pub uuid: String,
    pub name: String,
    pub email: String,
    pub idothis: Option<String>,
    pub bio: Option<String>,
    pub website: Option<String>,
    pub location: Option<String>,
    #[serde(rename = "imageFilename")]
    pub image_filename: Option<String>,
    #[serde(rename = "imageUrl")]
    pub image_url: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: Option<String>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
    #[serde(flatten)]
    pub additional_fields: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionlessInfo {
    pub uuid: String,
    #[serde(rename = "publicKey")]
    pub public_key: String,
}

// Environment configuration
fn get_service_url(service: &str) -> String {
    let env = env::var("IDOTHIS_ENV").unwrap_or_else(|_| "dev".to_string());
    
    println!("🔧 get_service_url: env={}, service={}", env, service);
    
    match env.as_str() {
        "local" => {
            match service {
                "prof" => "http://localhost:3008".to_string(),
                "bdo" => "http://localhost:3003".to_string(),
                "sanora" => "http://localhost:7243".to_string(),
                "dolores" => "http://localhost:3007".to_string(),
                _ => "http://localhost:3008".to_string(),
            }
        },
        "test" => {
            match service {
                "prof" => "http://localhost:5113".to_string(),
                "bdo" => "http://localhost:5114".to_string(),
                "sanora" => "http://localhost:5121".to_string(),
                "dolores" => "http://localhost:5118".to_string(),
                _ => "http://localhost:5113".to_string(),
            }
        },
        _ => { // dev
            match service {
                "prof" => "https://dev.prof.allyabase.com".to_string(),
                "bdo" => "https://dev.bdo.allyabase.com".to_string(),
                "sanora" => "https://dev.sanora.allyabase.com".to_string(),
                "dolores" => "https://dev.dolores.allyabase.com".to_string(),
                _ => "https://dev.prof.allyabase.com".to_string(),
            }
        }
    }
}

// Get environment config (for JavaScript sync)
#[tauri::command]
async fn get_env_config() -> Result<String, String> {
    let env = env::var("IDOTHIS_ENV").unwrap_or_else(|_| "dev".to_string());
    Ok(env)
}

// Create sessionless instance
fn create_sessionless() -> Sessionless {
    // Development sessionless instance (in production, this would be user-specific)
    Sessionless::new()
}

// Get sessionless info
#[tauri::command]
async fn get_sessionless_info() -> Result<SessionlessInfo, String> {
    let sessionless = create_sessionless();
    
    Ok(SessionlessInfo {
        uuid: sessionless.public_key().to_hex(),
        public_key: sessionless.public_key().to_hex(),
    })
}

// Profile Management Commands

#[tauri::command]
async fn create_profile(profile_data: ProfileData, image_data: Option<String>) -> Result<Profile, String> {
    println!("🔨 Creating profile with data: {:?}", profile_data);
    
    let sessionless = create_sessionless();
    let prof_url = get_service_url("prof");
    
    println!("🔗 Connecting to Prof service at: {}", prof_url);
    
    let prof_client = ProfClient::new(prof_url)
        .with_sessionless(sessionless);
    
    // Convert ProfileData to prof-rs expected format
    let mut prof_data = HashMap::new();
    prof_data.insert("name".to_string(), serde_json::Value::String(profile_data.name));
    prof_data.insert("email".to_string(), serde_json::Value::String(profile_data.email));
    
    if let Some(idothis) = profile_data.idothis {
        prof_data.insert("idothis".to_string(), serde_json::Value::String(idothis));
    }
    if let Some(bio) = profile_data.bio {
        prof_data.insert("bio".to_string(), serde_json::Value::String(bio));
    }
    if let Some(website) = profile_data.website {
        prof_data.insert("website".to_string(), serde_json::Value::String(website));
    }
    if let Some(location) = profile_data.location {
        prof_data.insert("location".to_string(), serde_json::Value::String(location));
    }
    
    // Add any additional fields
    for (key, value) in profile_data.additional_fields {
        prof_data.insert(key, value);
    }
    
    // Convert image data if provided
    let image_bytes = if let Some(base64_data) = image_data {
        match base64::decode(&base64_data) {
            Ok(bytes) => Some((bytes, "profile.jpg".to_string())),
            Err(e) => {
                println!("⚠️ Failed to decode image: {}", e);
                None
            }
        }
    } else {
        None
    };
    
    match prof_client.create_profile(prof_data, image_bytes).await {
        Ok(profile) => {
            println!("✅ Profile created successfully");
            
            // Convert prof response to our Profile structure
            let converted_profile = convert_prof_profile(profile);
            Ok(converted_profile)
        },
        Err(e) => {
            println!("❌ Failed to create profile: {}", e);
            Err(format!("Failed to create profile: {}", e))
        }
    }
}

#[tauri::command]
async fn get_profile() -> Result<Profile, String> {
    println!("🔍 Getting profile");
    
    let sessionless = create_sessionless();
    let prof_url = get_service_url("prof");
    
    let prof_client = ProfClient::new(prof_url)
        .with_sessionless(sessionless);
    
    match prof_client.get_profile(None).await {
        Ok(profile) => {
            println!("✅ Profile retrieved successfully");
            let converted_profile = convert_prof_profile(profile);
            Ok(converted_profile)
        },
        Err(e) => {
            println!("❌ Failed to get profile: {}", e);
            Err(format!("Failed to get profile: {}", e))
        }
    }
}

#[tauri::command]
async fn update_profile(profile_data: ProfileData, image_data: Option<String>) -> Result<Profile, String> {
    println!("🔄 Updating profile with data: {:?}", profile_data);
    
    let sessionless = create_sessionless();
    let prof_url = get_service_url("prof");
    
    let prof_client = ProfClient::new(prof_url)
        .with_sessionless(sessionless);
    
    // Convert ProfileData to prof-rs expected format
    let mut prof_data = HashMap::new();
    prof_data.insert("name".to_string(), serde_json::Value::String(profile_data.name));
    prof_data.insert("email".to_string(), serde_json::Value::String(profile_data.email));
    
    if let Some(idothis) = profile_data.idothis {
        prof_data.insert("idothis".to_string(), serde_json::Value::String(idothis));
    }
    if let Some(bio) = profile_data.bio {
        prof_data.insert("bio".to_string(), serde_json::Value::String(bio));
    }
    if let Some(website) = profile_data.website {
        prof_data.insert("website".to_string(), serde_json::Value::String(website));
    }
    if let Some(location) = profile_data.location {
        prof_data.insert("location".to_string(), serde_json::Value::String(location));
    }
    
    // Convert image data if provided
    let image_bytes = if let Some(base64_data) = image_data {
        match base64::decode(&base64_data) {
            Ok(bytes) => Some((bytes, "profile.jpg".to_string())),
            Err(e) => {
                println!("⚠️ Failed to decode image: {}", e);
                None
            }
        }
    } else {
        None
    };
    
    match prof_client.update_profile(prof_data, image_bytes).await {
        Ok(profile) => {
            println!("✅ Profile updated successfully");
            let converted_profile = convert_prof_profile(profile);
            Ok(converted_profile)
        },
        Err(e) => {
            println!("❌ Failed to update profile: {}", e);
            Err(format!("Failed to update profile: {}", e))
        }
    }
}

#[tauri::command]
async fn delete_profile() -> Result<String, String> {
    println!("🗑️ Deleting profile");
    
    let sessionless = create_sessionless();
    let prof_url = get_service_url("prof");
    
    let prof_client = ProfClient::new(prof_url)
        .with_sessionless(sessionless);
    
    match prof_client.delete_profile().await {
        Ok(_) => {
            println!("✅ Profile deleted successfully");
            Ok("Profile deleted successfully".to_string())
        },
        Err(e) => {
            println!("❌ Failed to delete profile: {}", e);
            Err(format!("Failed to delete profile: {}", e))
        }
    }
}

// Profile Discovery Commands (for swipeable interface)

#[tauri::command]
async fn get_all_profiles() -> Result<Vec<Profile>, String> {
    println!("👥 Getting all profiles for discovery");
    
    // In a real implementation, this would fetch profiles from a discovery service
    // For now, we'll return mock profiles for demonstration
    // TODO: Implement actual profile discovery via BDO or dedicated service
    
    let mock_profiles = vec![
        Profile {
            uuid: "mock-1".to_string(),
            name: "Alice Developer".to_string(),
            email: "alice@example.com".to_string(),
            idothis: Some("Full-stack web development".to_string()),
            bio: Some("Passionate about creating beautiful, functional web applications using modern technologies.".to_string()),
            website: Some("https://alice.dev".to_string()),
            location: Some("San Francisco, CA".to_string()),
            image_filename: None,
            image_url: None,
            created_at: Some("2025-01-15T10:30:00Z".to_string()),
            updated_at: Some("2025-01-15T10:30:00Z".to_string()),
            additional_fields: HashMap::new(),
        },
        Profile {
            uuid: "mock-2".to_string(),
            name: "Bob Designer".to_string(),
            email: "bob@example.com".to_string(),
            idothis: Some("UI/UX Design & Branding".to_string()),
            bio: Some("Creative designer specializing in user experience and visual identity for startups and small businesses.".to_string()),
            website: Some("https://bobdesigns.co".to_string()),
            location: Some("New York, NY".to_string()),
            image_filename: None,
            image_url: None,
            created_at: Some("2025-01-14T15:45:00Z".to_string()),
            updated_at: Some("2025-01-14T15:45:00Z".to_string()),
            additional_fields: HashMap::new(),
        },
        Profile {
            uuid: "mock-3".to_string(),
            name: "Carol Consultant".to_string(),
            email: "carol@example.com".to_string(),
            idothis: Some("Business strategy consulting".to_string()),
            bio: Some("Helping businesses grow through strategic planning, market analysis, and operational optimization.".to_string()),
            website: Some("https://carolconsulting.com".to_string()),
            location: Some("Austin, TX".to_string()),
            image_filename: None,
            image_url: None,
            created_at: Some("2025-01-13T09:15:00Z".to_string()),
            updated_at: Some("2025-01-13T09:15:00Z".to_string()),
            additional_fields: HashMap::new(),
        },
    ];
    
    println!("✅ Returning {} mock profiles", mock_profiles.len());
    Ok(mock_profiles)
}

// Utility function to convert prof-rs profile to our Profile structure
fn convert_prof_profile(prof_profile: prof_rs::Profile) -> Profile {
    let sessionless = create_sessionless();
    let prof_url = get_service_url("prof");
    
    // Generate image URL if image filename exists
    let image_url = if let Some(ref filename) = prof_profile.image_filename {
        if !filename.is_empty() {
            Some(format!("{}/user/{}/profile/image", prof_url.trim_end_matches('/'), sessionless.public_key().to_hex()))
        } else {
            None
        }
    } else {
        None
    };
    
    Profile {
        uuid: sessionless.public_key().to_hex(),
        name: prof_profile.name,
        email: prof_profile.email,
        idothis: prof_profile.additional_fields.get("idothis")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
        bio: prof_profile.additional_fields.get("bio")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
        website: prof_profile.additional_fields.get("website")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
        location: prof_profile.additional_fields.get("location")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
        image_filename: prof_profile.image_filename,
        image_url,
        created_at: Some(prof_profile.created_at),
        updated_at: Some(prof_profile.updated_at),
        additional_fields: prof_profile.additional_fields,
    }
}

// Debug command
#[tauri::command]
async fn dbg(message: String) -> Result<String, String> {
    println!("🐛 DEBUG: {}", message);
    Ok(format!("Debug logged: {}", message))
}

// Health check
#[tauri::command]
async fn health_check() -> Result<String, String> {
    Ok("IDothis backend is healthy".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_env_config,
            get_sessionless_info,
            create_profile,
            get_profile,
            update_profile,
            delete_profile,
            get_all_profiles,
            dbg,
            health_check
        ])
        .setup(|_app| {
            println!("💼 IDothis backend is starting up...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}