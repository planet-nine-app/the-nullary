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
pub struct VideoFeedData {
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
            lexary: Some(vec!["tech".to_string(), "programming".to_string()]),
            photary: Some(vec!["cats".to_string(), "photography".to_string()]),
            viewary: Some(vec!["comedy".to_string(), "education".to_string(), "entertainment".to_string()]),
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
            photary: Some(vec!["art".to_string(), "street".to_string()]),
            viewary: Some(vec!["tutorials".to_string(), "vlogs".to_string(), "music".to_string()]),
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

// Video feed management commands

#[command]
pub async fn get_video_feed(dolores_url: Option<String>, tags: Option<Vec<String>>) -> ServiceResponse<VideoFeedData> {
    match get_video_feed_internal(dolores_url, tags).await {
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

async fn get_video_feed_internal(dolores_url: Option<String>, tags: Option<Vec<String>>) -> Result<VideoFeedData, String> {
    let sessionless = get_sessionless().await?;
    let dolores_url = dolores_url.unwrap_or_else(|| "https://dev.dolores.allyabase.com/".to_string());
    
    // Try to get real feed from Dolores
    match DoloresClient::new(dolores_url.clone(), sessionless.clone()) {
        Ok(dolores_client) => {
            match dolores_client.get_feed(sessionless.uuid.clone(), tags.unwrap_or_else(|| vec!["videos".to_string(), "entertainment".to_string()])).await {
                Ok(feed_items) => {
                    let video_posts: Vec<serde_json::Value> = feed_items
                        .into_iter()
                        .filter(|item| {
                            // Filter for video-based posts
                            item.get("url").and_then(|u| u.as_str()).is_some() ||
                            item.get("video_url").and_then(|u| u.as_str()).is_some()
                        })
                        .map(|item| serde_json::json!({
                            "uuid": item.get("uuid").unwrap_or(&serde_json::Value::String("unknown".to_string())),
                            "title": item.get("title").unwrap_or(&serde_json::Value::String("".to_string())),
                            "description": item.get("description").unwrap_or(&serde_json::Value::String("".to_string())),
                            "url": item.get("url").or_else(|| item.get("video_url")).unwrap_or(&serde_json::Value::String("".to_string())),
                            "thumbnail": item.get("thumbnail").unwrap_or(&serde_json::Value::String("".to_string())),
                            "duration": item.get("duration").unwrap_or(&serde_json::Value::Number(serde_json::Number::from(0))),
                            "timestamp": item.get("timestamp").unwrap_or(&serde_json::Value::Number(serde_json::Number::from(chrono::Utc::now().timestamp_millis()))),
                            "author": item.get("author").unwrap_or(&serde_json::Value::String("Anonymous".to_string())),
                            "tags": item.get("tags").unwrap_or(&serde_json::Value::Array(vec![]))
                        }))
                        .collect();

                    return Ok(VideoFeedData {
                        video_posts,
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

    // Return mock video posts for development
    let mock_video_posts = vec![
        serde_json::json!({
            "uuid": "video-1",
            "title": "Rust Programming Tutorial",
            "description": "Learn Rust programming from scratch with this comprehensive tutorial",
            "url": "./sample1.mp4",
            "thumbnail": "https://img.youtube.com/vi/sample1/maxresdefault.jpg",
            "duration": 600,
            "timestamp": chrono::Utc::now().timestamp_millis() - 3600000,
            "author": "CodeMaster",
            "tags": ["programming", "rust", "tutorial"]
        }),
        serde_json::json!({
            "uuid": "video-2",
            "title": "Amazing Nature Timelapse",
            "description": "Beautiful timelapse of nature scenes from around the world",
            "url": "./sample2.mp4", 
            "thumbnail": "https://img.youtube.com/vi/sample2/maxresdefault.jpg",
            "duration": 180,
            "timestamp": chrono::Utc::now().timestamp_millis() - 7200000,
            "author": "NatureFilms",
            "tags": ["nature", "timelapse", "beauty"]
        }),
        serde_json::json!({
            "uuid": "video-3",
            "title": "Funny Cat Compilation",
            "description": "Hilarious cat videos that will make you laugh",
            "url": "./sample3.mp4",
            "thumbnail": "https://img.youtube.com/vi/sample3/maxresdefault.jpg",
            "duration": 300,
            "timestamp": chrono::Utc::now().timestamp_millis() - 10800000,
            "author": "CatLover",
            "tags": ["cats", "funny", "animals"]
        }),
        serde_json::json!({
            "uuid": "video-4",
            "title": "Cooking Made Easy",
            "description": "Quick and easy recipes for busy people",
            "url": "./sample4.mp4",
            "thumbnail": "https://img.youtube.com/vi/sample4/maxresdefault.jpg",
            "duration": 450,
            "timestamp": chrono::Utc::now().timestamp_millis() - 14400000,
            "author": "ChefQuick",
            "tags": ["cooking", "food", "tutorial"]
        }),
        serde_json::json!({
            "uuid": "video-5",
            "title": "Tech News Update",
            "description": "Latest technology news and updates from this week",
            "url": "./sample5.mp4",
            "thumbnail": "https://img.youtube.com/vi/sample5/maxresdefault.jpg",
            "duration": 720,
            "timestamp": chrono::Utc::now().timestamp_millis() - 18000000,
            "author": "TechReporter",
            "tags": ["technology", "news", "updates"]
        })
    ];

    Ok(VideoFeedData {
        video_posts: mock_video_posts,
    })
}

#[command]
pub async fn refresh_video_feed(dolores_url: Option<String>, tags: Option<Vec<String>>) -> ServiceResponse<VideoFeedData> {
    // Same as get_video_feed but could implement cache invalidation
    get_video_feed(dolores_url, tags).await
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
        "app": "viewary",
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
    println!("Viewary Debug: {}", message);
    format!("Debug logged: {}", message)
}