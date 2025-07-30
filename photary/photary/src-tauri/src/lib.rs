use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use tauri::command;

// Planet Nine service clients
use bdo_rs::BdoClient;
use dolores_rs::DoloresClient;
use sessionless::{Sessionless, PrivateKey};

#[derive(Debug, Serialize, Deserialize)]
pub struct BaseData {
    pub name: String,
    pub description: String,
    pub location: Option<LocationData>,
    pub soma: Option<SomaData>,
    pub dns: Option<DnsData>,
    pub joined: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LocationData {
    pub latitude: f64,
    pub longitude: f64,
    pub postal_code: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SomaData {
    pub lexary: Option<Vec<String>>,
    pub photary: Option<Vec<String>>,
    pub viewary: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DnsData {
    pub bdo: String,
    pub dolores: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FeedData {
    pub text_posts: Vec<serde_json::Value>,
    pub image_posts: Vec<serde_json::Value>,
    pub video_posts: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
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

// Base management commands

#[command]
pub async fn get_bases() -> ServiceResponse<Vec<BaseData>> {
    match get_bases_internal().await {
        Ok(bases) => ServiceResponse {
            success: true,
            data: Some(bases),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_bases_internal() -> Result<Vec<BaseData>, String> {
    // For now, return development bases
    // In a full implementation, this would query base discovery services
    
    let dev_base = BaseData {
        name: "DEV".to_string(),
        description: "Development base for testing. May be unstable.".to_string(),
        location: Some(LocationData {
            latitude: 36.788,
            longitude: -119.417,
            postal_code: Some("94102".to_string()),
        }),
        soma: Some(SomaData {
            lexary: Some(vec!["science".to_string(), "books".to_string()]),
            photary: Some(vec!["cats".to_string(), "photography".to_string()]),
            viewary: Some(vec!["thevids".to_string(), "entertainment".to_string()]),
        }),
        dns: Some(DnsData {
            bdo: "https://dev.bdo.allyabase.com/".to_string(),
            dolores: "https://dev.dolores.allyabase.com/".to_string(),
        }),
        joined: true,
    };

    let community_base = BaseData {
        name: "COMMUNITY".to_string(),
        description: "Community-run base with diverse content.".to_string(),
        location: Some(LocationData {
            latitude: 40.7128,
            longitude: -74.0060,
            postal_code: Some("10001".to_string()),
        }),
        soma: Some(SomaData {
            lexary: Some(vec!["community".to_string(), "discussion".to_string()]),
            photary: Some(vec!["art".to_string(), "street".to_string(), "people".to_string()]),
            viewary: Some(vec!["tutorials".to_string(), "vlogs".to_string()]),
        }),
        dns: Some(DnsData {
            bdo: "https://community.bdo.allyabase.com/".to_string(),
            dolores: "https://community.dolores.allyabase.com/".to_string(),
        }),
        joined: false,
    };

    Ok(vec![dev_base, community_base])
}

#[command]
pub async fn join_base(base_name: String) -> ServiceResponse<bool> {
    match join_base_internal(base_name).await {
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

async fn join_base_internal(base_name: String) -> Result<bool, String> {
    // In a full implementation, this would:
    // 1. Connect to the base
    // 2. Register with their services
    // 3. Save the configuration locally
    
    println!("Joining base: {}", base_name);
    Ok(true)
}

#[command]
pub async fn leave_base(base_name: String) -> ServiceResponse<bool> {
    match leave_base_internal(base_name).await {
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

async fn leave_base_internal(base_name: String) -> Result<bool, String> {
    println!("Leaving base: {}", base_name);
    Ok(true)
}

// Feed management commands

#[command]
pub async fn get_feed(dolores_url: Option<String>, tags: Option<Vec<String>>) -> ServiceResponse<FeedData> {
    match get_feed_internal(dolores_url, tags).await {
        Ok(feed) => ServiceResponse {
            success: true,
            data: Some(feed),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_feed_internal(dolores_url: Option<String>, tags: Option<Vec<String>>) -> Result<FeedData, String> {
    let sessionless = get_sessionless().await?;
    let dolores_url = dolores_url.unwrap_or_else(|| "https://dev.dolores.allyabase.com/".to_string());
    
    // Try to get real feed from Dolores
    match DoloresClient::new(dolores_url.clone(), sessionless.clone()) {
        Ok(dolores_client) => {
            match dolores_client.get_feed(sessionless.uuid.clone(), tags.unwrap_or_else(|| vec!["photos".to_string()])).await {
                Ok(feed_items) => {
                    let image_posts: Vec<serde_json::Value> = feed_items
                        .into_iter()
                        .map(|item| serde_json::json!({
                            "uuid": item.get("uuid").unwrap_or(&serde_json::Value::String("unknown".to_string())),
                            "title": item.get("title").unwrap_or(&serde_json::Value::String("".to_string())),
                            "description": item.get("description").unwrap_or(&serde_json::Value::String("".to_string())),
                            "images": item.get("images").unwrap_or(&serde_json::Value::Array(vec![])),
                            "timestamp": item.get("timestamp").unwrap_or(&serde_json::Value::Number(serde_json::Number::from(chrono::Utc::now().timestamp_millis()))),
                            "author": item.get("author").unwrap_or(&serde_json::Value::String("Anonymous".to_string()))
                        }))
                        .collect();

                    return Ok(FeedData {
                        text_posts: vec![],
                        image_posts,
                        video_posts: vec![],
                    });
                }
                Err(e) => {
                    println!("Failed to get real feed: {}", e);
                    // Fall through to mock data
                }
            }
        }
        Err(e) => {
            println!("Failed to create Dolores client: {}", e);
            // Fall through to mock data
        }
    }

    // Return mock data for development
    let mock_image_posts = vec![
        serde_json::json!({
            "uuid": "mock-1",
            "title": "Beautiful Sunset",
            "description": "A stunning sunset over the mountains, captured during a hiking trip last weekend.",
            "images": [
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
                "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
                "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800"
            ],
            "timestamp": chrono::Utc::now().timestamp_millis() - 3600000,
            "author": "NaturePhotographer"
        }),
        serde_json::json!({
            "uuid": "mock-2",
            "title": "City Architecture",
            "description": "Modern architectural marvels in the downtown district.",
            "images": [
                "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
            ],
            "timestamp": chrono::Utc::now().timestamp_millis() - 7200000,
            "author": "UrbanExplorer"
        }),
        serde_json::json!({
            "uuid": "mock-3",
            "title": "Ocean Waves",
            "description": "Peaceful waves crashing on the shore during golden hour.",
            "images": [
                "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800"
            ],
            "timestamp": chrono::Utc::now().timestamp_millis() - 10800000,
            "author": "SeaLover"
        }),
        serde_json::json!({
            "uuid": "mock-4",
            "title": "Forest Trail",
            "description": "A serene walking path through an old growth forest.",
            "images": [
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
                "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
                "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800"
            ],
            "timestamp": chrono::Utc::now().timestamp_millis() - 14400000,
            "author": "ForestWanderer"
        }),
        serde_json::json!({
            "uuid": "mock-5",
            "title": "Urban Street Art",
            "description": "Colorful murals and street art from the arts district.",
            "images": [
                "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
            ],
            "timestamp": chrono::Utc::now().timestamp_millis() - 18000000,
            "author": "StreetArtist"
        })
    ];

    Ok(FeedData {
        text_posts: vec![],
        image_posts: mock_image_posts,
        video_posts: vec![],
    })
}

#[command]
pub async fn refresh_feed(dolores_url: Option<String>, tags: Option<Vec<String>>) -> ServiceResponse<FeedData> {
    // Same as get_feed but could implement cache invalidation
    get_feed(dolores_url, tags).await
}

// User management commands

#[command]
pub async fn create_bdo_user(bdo_url: String) -> ServiceResponse<serde_json::Value> {
    match create_bdo_user_internal(bdo_url).await {
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

async fn create_bdo_user_internal(bdo_url: String) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    
    match BdoClient::new(bdo_url, sessionless.clone()) {
        Ok(bdo_client) => {
            match bdo_client.create_user().await {
                Ok(user) => Ok(serde_json::to_value(user).unwrap()),
                Err(e) => Err(format!("Failed to create BDO user: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create BDO client: {}", e)),
    }
}

#[command]
pub async fn create_dolores_user(dolores_url: String) -> ServiceResponse<serde_json::Value> {
    match create_dolores_user_internal(dolores_url).await {
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

async fn create_dolores_user_internal(dolores_url: String) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    
    match DoloresClient::new(dolores_url, sessionless.clone()) {
        Ok(dolores_client) => {
            match dolores_client.create_user().await {
                Ok(user) => Ok(serde_json::to_value(user).unwrap()),
                Err(e) => Err(format!("Failed to create Dolores user: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create Dolores client: {}", e)),
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
        "app": "photary",
        "version": "0.0.1",
        "services": {
            "bdo": "https://dev.bdo.allyabase.com/",
            "dolores": "https://dev.dolores.allyabase.com/"
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
    println!("Photary Debug: {}", message);
    format!("Debug logged: {}", message)
}