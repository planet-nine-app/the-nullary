use bdo_rs::structs::BDOUser;
use bdo_rs::{Bases, BDO};
use dolores_rs::structs::Feed;
use dolores_rs::{Dolores, DoloresUser};
use sanora_rs::structs::SanoraUser;
use sanora_rs::Sanora;
use prof_rs::{ProfClient, ProfileBuilder, Profile};
use reqwest::Client;
use serde_json::json;
use serde_json::Value;
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
use std::collections::HashMap;
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

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

/// Get sessionless information for the frontend
#[tauri::command]
async fn get_sessionless_info() -> Result<Value, String> {
    let sessionless = get_sessionless().await?;
    Ok(json!({
        "publicKey": sessionless.public_key().to_hex(),
        "ready": true
    }))
}

/// Get environment configuration from environment variables
#[tauri::command]
fn get_env_config() -> String {
    env::var("MYBASE_ENV").unwrap_or_else(|_| "dev".to_string())
}

/// Get service URL based on environment and service name
fn get_service_url(service: &str) -> String {
    let env = env::var("MYBASE_ENV").unwrap_or_else(|_| "dev".to_string());
    println!("🔧 get_service_url: env={}, service={}", env, service);
    
    let url = match (env.as_str(), service) {
        // Test environment (127.0.0.1:5111-5122)
        ("test", "bdo") => "http://127.0.0.1:5114/".to_string(),
        ("test", "dolores") => "http://127.0.0.1:5118/".to_string(),
        ("test", "sanora") => "http://127.0.0.1:5121/".to_string(),
        ("test", "prof") => "http://127.0.0.1:5113/".to_string(),
        
        // Local environment (127.0.0.1:3000-3011)
        ("local", "bdo") => "http://127.0.0.1:3003/".to_string(),
        ("local", "dolores") => "http://127.0.0.1:3005/".to_string(),
        ("local", "sanora") => "http://127.0.0.1:7243/".to_string(),
        ("local", "prof") => "http://127.0.0.1:3007/".to_string(),
        
        // Dev environment (default)
        (_, service) => format!("https://dev.{}.allyabase.com/", service),
    };
    
    println!("🔗 Resolved URL for {} in {} environment: {}", service, env, url);
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

/// Create a new BDO user for big dumb object storage
#[tauri::command]
async fn create_bdo_user() -> Result<BDOUser, String> {
    let s = get_sessionless().await;
    let mybase = "mybase";
    
    // Get BDO URL based on environment
    let bdo_url = get_service_url("bdo");
    let env = env::var("MYBASE_ENV").unwrap_or_else(|_| "dev".to_string());
    
    println!("🔗 Creating BDO user on: {} (env: {})", bdo_url, env);
    println!("🔍 BDO URL being passed to BDO::new: {:?}", &bdo_url);
    
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(
                Some(bdo_url),
                Some(sessionless),
            );
            let _user = bdo.create_user(&mybase, &json!({})).await;
            dbg!(&_user);
            return match _user {
                Ok(user) => Ok(user),
                Err(_) => Err("no user".to_string()),
            };
        }
        Err(_) => Err("no user".to_string()),
    }
}

/// Get available bases (servers) for connecting to
#[tauri::command]
async fn get_bases(uuid: &str, bdo_url: &str) -> Result<Value, String> {
    let s = get_sessionless().await;
    let mybase = "mybase";
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(Some(bdo_url.to_string()), Some(sessionless));
            let bases_result = bdo.get_bases(&uuid, &mybase).await;

            match bases_result {
                Ok(bases) => Ok(bases),
                Err(e) => {
                    dbg!(e);
                    Err("no bases".to_string())
                }
            }
        }
        Err(_) => Err("no bdo".to_string()),
    }
}

/// Get bases from BDO (alias for base-command.js compatibility)
#[tauri::command]
async fn get_bases_from_bdo(uuid: &str, bdo_url: &str) -> Result<Value, String> {
    get_bases(uuid, bdo_url).await
}

/// Get bases without parameters (for shared base-command.js)
#[tauri::command]
async fn get_bases_simple() -> Result<Value, String> {
    let sessionless = get_sessionless().await.map_err(|e| format!("Failed to get sessionless: {}", e))?;
    let bdo_url = get_service_url("bdo");
    let uuid = sessionless.public_key().to_hex();
    
    get_bases(&uuid, &bdo_url).await
}

/// Connect to a service (placeholder for base-command.js compatibility)
#[tauri::command]
async fn connect_to_service(service_url: &str, service_name: &str) -> Result<Value, String> {
    let sessionless = get_sessionless().await.map_err(|e| format!("Failed to get sessionless: {}", e))?;
    
    match service_name {
        "bdo" => {
            let bdo = BDO::new(Some(service_url.to_string()), Some(sessionless));
            let mybase = "mybase";
            match bdo.create_user(&mybase, &json!({})).await {
                Ok(user) => Ok(json!({"uuid": user.uuid})),
                Err(e) => Err(format!("Failed to connect to BDO: {}", e)),
            }
        },
        "dolores" => {
            let dolores = Dolores::new(Some(service_url.to_string()), Some(sessionless));
            match dolores.create_user().await {
                Ok(user) => Ok(json!({"uuid": user.uuid})),
                Err(e) => Err(format!("Failed to connect to Dolores: {}", e)),
            }
        },
        _ => Err(format!("Unknown service: {}", service_name))
    }
}

/// Join a base (placeholder for base-command.js compatibility)
#[tauri::command]
async fn join_base(base_name: &str) -> Result<Value, String> {
    println!("📥 Joining base: {}", base_name);
    // For now, just return success - base joining is handled by the base discovery
    Ok(json!({"success": true, "message": format!("Joined base: {}", base_name)}))
}

/// Leave a base (placeholder for base-command.js compatibility)
#[tauri::command]
async fn leave_base(base_name: &str) -> Result<Value, String> {
    println!("📤 Leaving base: {}", base_name);
    // For now, just return success - base leaving is handled by the base discovery
    Ok(json!({"success": true, "message": format!("Left base: {}", base_name)}))
}

/// Create a new Dolores user for social media feeds
#[tauri::command]
async fn create_dolores_user(dolores_url: &str) -> Result<DoloresUser, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let dolores = Dolores::new(Some(dolores_url.to_string()), Some(sessionless));
            let _user = dolores.create_user().await;
            dbg!(&_user);
            return match _user {
                Ok(user) => Ok(user),
                Err(_) => Err("no user".to_string()),
            };
        }
        Err(_) => Err("no user".to_string()),
    }
}

/// Get social media feed from Dolores with specific tags
#[tauri::command]
async fn get_feed(uuid: &str, dolores_url: &str, tags: &str) -> Result<Feed, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let dolores = Dolores::new(Some(dolores_url.to_string()), Some(sessionless));
            let feed_result = dolores.get_feed(&uuid, &tags).await;

            match feed_result {
                Ok(feed) => Ok(feed),
                Err(e) => {
                    dbg!(e);
                    Err("no feed".to_string())
                }
            }
        }
        Err(_) => Err("no dolores".to_string()),
    }
}

/// Get social feed for MyBase interface
#[tauri::command]
async fn get_social_feed(
    base_name: Option<String>,
    limit: Option<u32>,
    offset: Option<u32>,
) -> Result<Value, String> {
    let sessionless = get_sessionless().await.map_err(|e| format!("Failed to get sessionless: {}", e))?;
    let dolores_url = get_service_url("dolores");
    
    println!("🔍 Getting social feed from: {}", dolores_url);
    
    // Create/get Dolores user first
    let dolores = Dolores::new(Some(dolores_url), Some(sessionless));
    let dolores_user = match dolores.create_user().await {
        Ok(user) => {
            println!("✅ Dolores user ready: {}", user.uuid);
            user
        }
        Err(e) => {
            println!("❌ Failed to create Dolores user: {:?}", e);
            return Err(format!("Failed to create Dolores user: {}", e));
        }
    };
    
    // Get feed with social/mybase tags
    let tags = "social,mybase";
    match dolores.get_feed(&dolores_user.uuid, tags).await {
        Ok(feed) => {
            println!("✅ Feed retrieved with {} posts", feed.allPosts.len());
            
            // Transform feed data for frontend
            let posts: Vec<Value> = feed.allPosts.into_iter().map(|post| {
                // Extract values from the JSON object
                let uuid = post.get("uuid").and_then(|v| v.as_str()).unwrap_or("unknown");
                let post_type = post.get("post_type").and_then(|v| v.as_str()).unwrap_or("text");
                let author_name = post.get("author_name").and_then(|v| v.as_str()).unwrap_or("Anonymous");
                let author_uuid = post.get("author_uuid").and_then(|v| v.as_str()).unwrap_or("");
                let title = post.get("title").and_then(|v| v.as_str()).unwrap_or("");
                let content = post.get("content").and_then(|v| v.as_str()).unwrap_or("");
                let tags = post.get("tags").and_then(|v| v.as_str()).unwrap_or("");
                let created_at = post.get("created_at").and_then(|v| v.as_str()).unwrap_or("");
                
                json!({
                    "uuid": uuid,
                    "post_type": post_type,
                    "author": {
                        "name": author_name,
                        "uuid": author_uuid,
                        "image_url": null
                    },
                    "content": {
                        "title": title,
                        "content": content,
                        "tags": tags
                    },
                    "timestamp": created_at,
                    "likes": 0,
                    "comments": 0,
                    "shares": 0
                })
            }).collect();
            
            Ok(json!({
                "success": true,
                "data": {
                    "posts": posts,
                    "total": posts.len(),
                    "limit": limit.unwrap_or(20),
                    "offset": offset.unwrap_or(0)
                }
            }))
        }
        Err(e) => {
            println!("❌ Failed to get feed: {:?}", e);
            // Return empty feed instead of error for better UX
            Ok(json!({
                "success": true,
                "data": {
                    "posts": [],
                    "total": 0,
                    "limit": limit.unwrap_or(20),
                    "offset": offset.unwrap_or(0)
                }
            }))
        }
    }
}

/// Create a new Sanora user for blog/content hosting
#[tauri::command]
async fn create_sanora_user(sanora_url: &str) -> Result<SanoraUser, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            let _user = sanora.create_user().await;
            dbg!(&_user);
            return match _user {
                Ok(user) => Ok(user),
                Err(_) => Err("no user".to_string()),
            };
        }
        Err(_) => Err("no user".to_string()),
    }
}

/// Get Sanora user information (which includes their content)
#[tauri::command]
async fn get_sanora_user(uuid: &str, sanora_url: &str) -> Result<SanoraUser, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            let user_result = sanora.get_user_by_uuid(&uuid).await;

            match user_result {
                Ok(user) => Ok(user),
                Err(e) => {
                    dbg!(e);
                    Err("failed to get user".to_string())
                }
            }
        }
        Err(_) => Err("no sanora".to_string()),
    }
}

/// Create or update a user profile
#[tauri::command]
async fn create_profile(
    name: String,
    bio: Option<String>,
    interests: Option<String>,
    homepage: Option<String>,
    image_url: Option<String>,
) -> Result<Value, String> {
    let sessionless = get_sessionless().await.map_err(|e| format!("Failed to get sessionless: {}", e))?;
    let prof_url = get_service_url("prof");
    
    println!("📝 Creating profile on: {}", prof_url);
    
    // Use a placeholder email since it's required by Prof but we don't want to collect it
    let placeholder_email = format!("{}@mybase.local", sessionless.public_key().to_hex());
    
    let prof_client = ProfClient::new(prof_url).with_sessionless(sessionless);
    
    let mut profile_builder = ProfileBuilder::new()
        .name(&name)
        .email(&placeholder_email);
    
    if let Some(bio) = bio {
        profile_builder = profile_builder.field("bio", bio);
    }
    
    if let Some(interests) = interests {
        profile_builder = profile_builder.field("interests", interests);
    }
    
    if let Some(homepage) = homepage {
        profile_builder = profile_builder.field("homepage", homepage);
    }
    
    if let Some(image_url) = image_url {
        profile_builder = profile_builder.field("image_url", image_url);
    }
    
    let profile_data = profile_builder.build();
    
    println!("🔍 Profile data being sent: {:?}", profile_data);
    
    match prof_client.create_profile(profile_data, None).await {
        Ok(profile) => {
            println!("✅ Profile created successfully: {}", profile.uuid);
            Ok(json!({
                "success": true,
                "profile": {
                    "uuid": profile.uuid,
                    "name": profile.name,
                    "bio": profile.additional_fields.get("bio"),
                    "interests": profile.additional_fields.get("interests"),
                    "homepage": profile.additional_fields.get("homepage"),
                    "image_url": profile.additional_fields.get("image_url"),
                    "created_at": profile.created_at
                }
            }))
        }
        Err(e) => {
            println!("❌ Failed to create profile: {:?}", e);
            Err(format!("Failed to create profile: {}", e))
        }
    }
}

/// Get user profile
#[tauri::command]
async fn get_profile(uuid: Option<String>) -> Result<Value, String> {
    let sessionless = get_sessionless().await.map_err(|e| format!("Failed to get sessionless: {}", e))?;
    let prof_url = get_service_url("prof");
    
    println!("📖 Getting profile from: {}", prof_url);
    
    let prof_client = ProfClient::new(prof_url).with_sessionless(sessionless);
    
    match prof_client.get_profile(uuid.as_deref()).await {
        Ok(profile) => {
            println!("✅ Profile retrieved successfully: {}", profile.uuid);
            Ok(json!({
                "success": true,
                "profile": {
                    "uuid": profile.uuid,
                    "name": profile.name,
                    "bio": profile.additional_fields.get("bio"),
                    "interests": profile.additional_fields.get("interests"),
                    "homepage": profile.additional_fields.get("homepage"),
                    "image_url": profile.additional_fields.get("image_url"),
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at
                }
            }))
        }
        Err(prof_rs::ProfError::NotFound(_)) => {
            println!("📭 No profile found");
            Ok(json!({
                "success": false,
                "error": "profile_not_found",
                "message": "No profile exists for this user"
            }))
        }
        Err(e) => {
            println!("❌ Failed to get profile: {:?}", e);
            Err(format!("Failed to get profile: {}", e))
        }
    }
}

/// Update existing profile
#[tauri::command]
async fn update_profile(
    name: String,
    bio: Option<String>,
    interests: Option<String>,
    homepage: Option<String>,
    image_url: Option<String>,
) -> Result<Value, String> {
    let sessionless = get_sessionless().await.map_err(|e| format!("Failed to get sessionless: {}", e))?;
    let prof_url = get_service_url("prof");
    
    println!("📝 Updating profile on: {}", prof_url);
    
    // Use a placeholder email since it's required by Prof but we don't want to collect it
    let placeholder_email = format!("{}@mybase.local", sessionless.public_key().to_hex());
    
    let prof_client = ProfClient::new(prof_url).with_sessionless(sessionless);
    
    let mut profile_builder = ProfileBuilder::new()
        .name(&name)
        .email(&placeholder_email);
    
    if let Some(bio) = bio {
        profile_builder = profile_builder.field("bio", bio);
    }
    
    if let Some(interests) = interests {
        profile_builder = profile_builder.field("interests", interests);
    }
    
    if let Some(homepage) = homepage {
        profile_builder = profile_builder.field("homepage", homepage);
    }
    
    if let Some(image_url) = image_url {
        profile_builder = profile_builder.field("image_url", image_url);
    }
    
    let profile_data = profile_builder.build();
    
    match prof_client.update_profile(profile_data, None).await {
        Ok(profile) => {
            println!("✅ Profile updated successfully: {}", profile.uuid);
            Ok(json!({
                "success": true,
                "profile": {
                    "uuid": profile.uuid,
                    "name": profile.name,
                    "bio": profile.additional_fields.get("bio"),
                    "interests": profile.additional_fields.get("interests"),
                    "homepage": profile.additional_fields.get("homepage"),
                    "image_url": profile.additional_fields.get("image_url"),
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at
                }
            }))
        }
        Err(e) => {
            println!("❌ Failed to update profile: {:?}", e);
            Err(format!("Failed to update profile: {}", e))
        }
    }
}

/// Teleport content from a URL via BDO
#[tauri::command]
async fn teleport_content(bdo_url: &str, teleport_url: &str) -> Result<Value, String> {
    println!("🌐 Teleporting content from: {} via BDO: {}", teleport_url, bdo_url);
    
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(Some(bdo_url.to_string()), Some(sessionless));
            
            // Create/get BDO user first
            let mybase = "mybase";
            let bdo_user = match bdo.create_user(&mybase, &json!({})).await {
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
            match bdo.teleport(&bdo_user.uuid, &mybase, teleport_url).await {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            dbg,
            get_public_key,
            get_sessionless_info,
            get_env_config,
            create_bdo_user,
            get_bases,
            get_bases_from_bdo,
            get_bases_simple,
            connect_to_service,
            join_base,
            leave_base,
            create_dolores_user,
            get_feed,
            get_social_feed,
            create_sanora_user,
            get_sanora_user,
            create_profile,
            get_profile,
            update_profile,
            teleport_content
        ])
        .setup(|_app| {
            println!("🌐 MyBase backend is starting up...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}