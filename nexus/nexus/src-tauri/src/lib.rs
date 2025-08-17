use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::Manager;
use chrono::Utc;

// Import Planet Nine service clients
use bdo_rs::{BdoClient, BdoUser};
use dolores_rs::{DoloresClient, DoloresUser};
use sanora_rs::{SanoraClient, SanoraUser, Product};
use sessionless::{Sessionless, PrivateKey};
// User Persistence Module
mod user_persistence;
use user_persistence::*;


#[derive(Debug, Serialize, Deserialize)]
pub struct FeedPost {
    pub uuid: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub author: Option<String>,
    pub timestamp: Option<i64>,
    pub images: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub price: Option<f64>,
    pub post_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BaseInfo {
    pub name: String,
    pub description: Option<String>,
    pub connected: bool,
    pub services: HashMap<String, String>,
}

// Global state for service clients
static mut SESSIONLESS: Option<Sessionless> = None;
static mut BDO_CLIENT: Option<BdoClient> = None;
static mut DOLORES_CLIENT: Option<DoloresClient> = None;
static mut SANORA_CLIENT: Option<SanoraClient> = None;

#[tauri::command]
async fn get_feed_count(feed_type: String) -> Result<usize, String> {
    match feed_type.as_str() {
        "dolores" => {
            // Get real Dolores feed and return count
            match get_dolores_feed().await {
                Ok(feed) => Ok(feed.len()),
                Err(_) => Ok(0)
            }
        }
        "products" => {
            // Get real products feed and return count
            match get_products_feed().await {
                Ok(feed) => Ok(feed.len()),
                Err(_) => Ok(0)
            }
        }
        "blogs" => {
            // Get real blogs feed and return count
            match get_blogs_feed().await {
                Ok(feed) => Ok(feed.len()),
                Err(_) => Ok(0)
            }
        }
        _ => Ok(0)
    }
}

#[tauri::command]
async fn get_products_count() -> Result<usize, String> {
    // Get real products feed and return count
    match get_products_feed().await {
        Ok(feed) => Ok(feed.len()),
        Err(_) => Ok(0)
    }
}

#[tauri::command]
async fn get_blogs_count() -> Result<usize, String> {
    // Get real blogs feed and return count
    match get_blogs_feed().await {
        Ok(feed) => Ok(feed.len()),
        Err(_) => Ok(0)
    }
}

#[tauri::command]
async fn get_dolores_feed() -> Result<Vec<FeedPost>, String> {
    println!("🔍 Getting Dolores feed from test environment...");
    
    // Try to get real Dolores feed from test environment (localhost:5118)
    let sessionless = unsafe { SESSIONLESS.as_ref() };
    if sessionless.is_none() {
        return Err("Sessionless not initialized".to_string());
    }
    
    let sessionless = sessionless.unwrap();
    
    // Connect to test Dolores service
    let dolores_url = "http://127.0.0.1:5118/";
    println!("📡 Connecting to Dolores at {}", dolores_url);
    
    match DoloresClient::new(dolores_url.to_string(), sessionless.clone()) {
        Ok(client) => {
            // Create user if needed
            match client.create_user().await {
                Ok(user) => {
                    println!("✅ Connected to Dolores as user: {}", user.uuid);
                    
                    // Get feed with photary tags
                    let tags = vec!["photos".to_string(), "social".to_string(), "photary".to_string()];
                    match client.get_feed(&user.uuid, &tags).await {
                        Ok(feed_items) => {
                            println!("📋 Retrieved {} items from Dolores feed", feed_items.len());
                            
                            // Convert Dolores feed items to our FeedPost format
                            let posts = feed_items.into_iter().map(|item| {
                                FeedPost {
                                    uuid: item.uuid.unwrap_or_else(|| format!("dolores-{}", chrono::Utc::now().timestamp())),
                                    title: item.title,
                                    description: item.description,
                                    content: None,
                                    author: item.author.unwrap_or_else(|| "Anonymous".to_string()),
                                    timestamp: item.timestamp.map(|t| t as i64),
                                    images: item.images,
                                    tags: item.tags,
                                    price: None,
                                    post_type: "photo".to_string(),
                                }
                            }).collect();
                            
                            Ok(posts)
                        }
                        Err(e) => {
                            println!("⚠️ Failed to get Dolores feed: {}", e);
                            Ok(vec![]) // Return empty feed instead of error
                        }
                    }
                }
                Err(e) => {
                    println!("⚠️ Failed to create Dolores user: {}", e);
                    Ok(vec![]) // Return empty feed instead of error
                }
            }
        }
        Err(e) => {
            println!("❌ Failed to connect to Dolores: {}", e);
            Ok(vec![]) // Return empty feed instead of error
        }
    }
}

#[tauri::command]
async fn get_products_feed() -> Result<Vec<FeedPost>, String> {
    println!("🔍 Getting products feed from test environment...");
    
    // Try to get real products from test Sanora service (localhost:5121)
    let sessionless = unsafe { SESSIONLESS.as_ref() };
    if sessionless.is_none() {
        return Err("Sessionless not initialized".to_string());
    }
    
    let sessionless = sessionless.unwrap();
    
    // Connect to test Sanora service
    let sanora_url = "http://127.0.0.1:5121/";
    println!("📡 Connecting to Sanora at {}", sanora_url);
    
    match SanoraClient::new(sanora_url.to_string(), sessionless.clone()) {
        Ok(client) => {
            // Create user if needed
            match client.create_user().await {
                Ok(user) => {
                    println!("✅ Connected to Sanora as user: {}", user.uuid);
                    
                    // Get all products from this base
                    match client.get_all_base_products().await {
                        Ok(products) => {
                            println!("📋 Retrieved {} products from Sanora", products.len());
                            
                            // Filter for non-blog products and convert to FeedPost format
                            let posts = products.into_iter()
                                .filter(|product| {
                                    // Only include products that aren't blogs
                                    !product.tags.iter().any(|tag| tag.to_lowercase().contains("blog"))
                                })
                                .map(|product| {
                                    FeedPost {
                                        uuid: product.uuid.unwrap_or_else(|| format!("product-{}", chrono::Utc::now().timestamp())),
                                        title: Some(product.title),
                                        description: Some(product.description),
                                        content: None,
                                        author: Some("Marketplace".to_string()),
                                        timestamp: product.created_at.map(|t| t as i64),
                                        images: None, // Products might not have preview images in basic version
                                        tags: Some(product.tags),
                                        price: Some(product.price as f64 / 100.0), // Convert cents to dollars
                                        post_type: "product".to_string(),
                                    }
                                }).collect();
                            
                            Ok(posts)
                        }
                        Err(e) => {
                            println!("⚠️ Failed to get Sanora products: {}", e);
                            Ok(vec![]) // Return empty feed instead of error
                        }
                    }
                }
                Err(e) => {
                    println!("⚠️ Failed to create Sanora user: {}", e);
                    Ok(vec![]) // Return empty feed instead of error
                }
            }
        }
        Err(e) => {
            println!("❌ Failed to connect to Sanora: {}", e);
            Ok(vec![]) // Return empty feed instead of error
        }
    }
}

#[tauri::command]
async fn get_blogs_feed() -> Result<Vec<FeedPost>, String> {
    println!("🔍 Getting blogs feed from test environment...");
    
    // Try to get real blog posts from test Sanora service (localhost:5121)
    let sessionless = unsafe { SESSIONLESS.as_ref() };
    if sessionless.is_none() {
        return Err("Sessionless not initialized".to_string());
    }
    
    let sessionless = sessionless.unwrap();
    
    // Connect to test Sanora service
    let sanora_url = "http://127.0.0.1:5121/";
    println!("📡 Connecting to Sanora at {}", sanora_url);
    
    match SanoraClient::new(sanora_url.to_string(), sessionless.clone()) {
        Ok(client) => {
            // Create user if needed
            match client.create_user().await {
                Ok(user) => {
                    println!("✅ Connected to Sanora as user: {}", user.uuid);
                    
                    // Get all products from this base
                    match client.get_all_base_products().await {
                        Ok(products) => {
                            println!("📋 Retrieved {} products from Sanora", products.len());
                            
                            // Filter for blog products and convert to FeedPost format
                            let posts = products.into_iter()
                                .filter(|product| {
                                    // Only include products that are blogs
                                    product.tags.iter().any(|tag| tag.to_lowercase().contains("blog"))
                                })
                                .map(|product| {
                                    FeedPost {
                                        uuid: product.uuid.unwrap_or_else(|| format!("blog-{}", chrono::Utc::now().timestamp())),
                                        title: Some(product.title),
                                        description: Some(product.description),
                                        content: None, // Blog content would be in product details
                                        author: Some("Blogger".to_string()),
                                        timestamp: product.created_at.map(|t| t as i64),
                                        images: None,
                                        tags: Some(product.tags),
                                        price: product.price.then(|| product.price as f64 / 100.0), // Convert cents to dollars if paid blog
                                        post_type: "blog".to_string(),
                                    }
                                }).collect();
                            
                            Ok(posts)
                        }
                        Err(e) => {
                            println!("⚠️ Failed to get Sanora products for blogs: {}", e);
                            Ok(vec![]) // Return empty feed instead of error
                        }
                    }
                }
                Err(e) => {
                    println!("⚠️ Failed to create Sanora user: {}", e);
                    Ok(vec![]) // Return empty feed instead of error
                }
            }
        }
        Err(e) => {
            println!("❌ Failed to connect to Sanora: {}", e);
            Ok(vec![]) // Return empty feed instead of error
        }
    }
}

#[tauri::command]
async fn get_bases() -> Result<Vec<BaseInfo>, String> {
    println!("🔍 Getting bases from test environment...");
    
    // Try to get real base discovery from test BDO service (localhost:5114)
    let sessionless = unsafe { SESSIONLESS.as_ref() };
    if sessionless.is_none() {
        return Err("Sessionless not initialized".to_string());
    }
    
    let sessionless = sessionless.unwrap();
    
    // Connect to test BDO service
    let bdo_url = "http://127.0.0.1:5114/";
    println!("📡 Connecting to BDO at {}", bdo_url);
    
    match BdoClient::new(bdo_url.to_string(), sessionless.clone()) {
        Ok(client) => {
            // Create user if needed
            match client.create_user().await {
                Ok(user) => {
                    println!("✅ Connected to BDO as user: {}", user.uuid);
                    
                    // Try to get base discovery data
                    // For now, return test environment base configuration
                    let bases = vec![
                        BaseInfo {
                            name: "Test Base 1".to_string(),
                            description: Some("Test environment base server on port 5111".to_string()),
                            connected: true,
                            services: {
                                let mut services = HashMap::new();
                                services.insert("bdo".to_string(), "http://127.0.0.1:5114/".to_string());
                                services.insert("dolores".to_string(), "http://127.0.0.1:5118/".to_string());
                                services.insert("sanora".to_string(), "http://127.0.0.1:5121/".to_string());
                                services
                            },
                        },
                        BaseInfo {
                            name: "Test Base 2".to_string(),
                            description: Some("Test environment base server on port 5112".to_string()),
                            connected: false,
                            services: {
                                let mut services = HashMap::new();
                                services.insert("bdo".to_string(), "http://127.0.0.1:5115/".to_string());
                                services.insert("dolores".to_string(), "http://127.0.0.1:5119/".to_string());
                                services.insert("sanora".to_string(), "http://127.0.0.1:5122/".to_string());
                                services
                            },
                        },
                    ];
                    
                    Ok(bases)
                }
                Err(e) => {
                    println!("⚠️ Failed to create BDO user: {}", e);
                    Ok(vec![]) // Return empty instead of error
                }
            }
        }
        Err(e) => {
            println!("❌ Failed to connect to BDO: {}", e);
            Ok(vec![]) // Return empty instead of error
        }
    }
}

#[tauri::command]
async fn initialize_clients() -> Result<String, String> {
    println!("🔧 Initializing Planet Nine service clients...");
    
    // Initialize sessionless with default key
    let private_key = std::env::var("PRIVATE_KEY").unwrap_or_else(|_| {
        "b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496".to_string()
    });
    
    let sessionless = match Sessionless::from_private_key(PrivateKey::from_hex(private_key).map_err(|e| e.to_string())?) {
        Ok(s) => s,
        Err(e) => return Err(format!("Failed to create sessionless: {}", e)),
    };
    
    unsafe {
        SESSIONLESS = Some(sessionless);
    }
    
    println!("✅ Service clients initialized");
    Ok("Clients initialized successfully".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
get_feed_count,
            get_products_count,
            get_blogs_count,
            get_dolores_feed,
            get_products_feed,
            get_blogs_feed,
            get_bases,
            initialize_clients,

            // User Persistence Functions
            generate_sessionless_keys,
            stronghold_init,
            stronghold_get_record,
            stronghold_set_record,
            stronghold_clear_vault,
            read_user_data_file,
            write_user_data_file,
            clear_user_data
        ])
        .setup(|app| {
            println!("🌍 Nexus Portal starting...");
            
            // Initialize clients on startup
            tauri::async_runtime::spawn(async {
                if let Err(e) = initialize_clients().await {
                    eprintln!("❌ Failed to initialize clients: {}", e);
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}