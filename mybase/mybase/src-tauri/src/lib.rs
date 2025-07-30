use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use tauri::command;
use chrono::{DateTime, Utc};

// Planet Nine service clients
use prof_rs::ProfClient;
use bdo_rs::BdoClient;
use dolores_rs::DoloresClient;
use sessionless::{Sessionless, PrivateKey};

// Constants for base limits
const MAX_PROFILES_PER_BASE: usize = 999;
const MAX_POSTS_PER_BASE: usize = 999;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProfileData {
    pub uuid: String,
    pub name: String,
    pub email: String,
    pub bio: Option<String>,
    pub skills: Option<Vec<String>>,
    pub website: Option<String>,
    pub location: Option<String>,
    pub image_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub additional_fields: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BaseData {
    pub name: String,
    pub description: String,
    pub location: Option<LocationData>,
    pub soma: Option<SomaData>,
    pub dns: Option<DnsData>,
    pub joined: bool,
    pub profile_count: usize,
    pub post_count: usize,
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
    pub prof: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SocialPost {
    pub uuid: String,
    pub post_type: PostType,
    pub author: ProfileData,
    pub content: PostContent,
    pub timestamp: DateTime<Utc>,
    pub likes: u32,
    pub comments: u32,
    pub shares: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PostType {
    Text,
    Photo,
    Video,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum PostContent {
    Text {
        title: Option<String>,
        content: String,
        tags: Vec<String>,
    },
    Photo {
        title: Option<String>,
        description: String,
        images: Vec<String>,
        tags: Vec<String>,
    },
    Video {
        title: Option<String>,
        description: String,
        url: String,
        thumbnail: Option<String>,
        duration: Option<u32>,
        tags: Vec<String>,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SocialFeedData {
    pub posts: Vec<SocialPost>,
    pub total_count: usize,
    pub has_more: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BaseStats {
    pub profile_count: usize,
    pub post_count: usize,
    pub max_profiles: usize,
    pub max_posts: usize,
    pub can_add_profile: bool,
    pub can_add_post: bool,
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

// Profile management commands

#[command]
pub async fn create_profile(
    profile_data: HashMap<String, serde_json::Value>,
    image_data: Option<String>
) -> ServiceResponse<ProfileData> {
    match create_profile_internal(profile_data, image_data).await {
        Ok(profile) => ServiceResponse {
            success: true,
            data: Some(profile),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn create_profile_internal(
    profile_data: HashMap<String, serde_json::Value>,
    image_data: Option<String>
) -> Result<ProfileData, String> {
    let prof_url = "http://localhost:3007".to_string();
    let sessionless = get_sessionless().await?;
    
    match ProfClient::new(prof_url) {
        Ok(prof_client) => {
            match prof_client.create_profile(sessionless, profile_data, image_data).await {
                Ok(profile_response) => {
                    // Convert prof response to ProfileData
                    let profile = ProfileData {
                        uuid: profile_response.get("uuid")
                            .and_then(|v| v.as_str())
                            .unwrap_or("unknown")
                            .to_string(),
                        name: profile_response.get("name")
                            .and_then(|v| v.as_str())
                            .unwrap_or("Anonymous")
                            .to_string(),
                        email: profile_response.get("email")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string(),
                        bio: profile_response.get("bio")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        skills: profile_response.get("skills")
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect()),
                        website: profile_response.get("website")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        location: profile_response.get("location")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        image_url: profile_response.get("image_url")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        created_at: Utc::now(),
                        additional_fields: HashMap::new(),
                    };
                    
                    Ok(profile)
                }
                Err(e) => Err(format!("Failed to create profile: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create prof client: {}", e)),
    }
}

#[command]
pub async fn get_profile(uuid: String) -> ServiceResponse<ProfileData> {
    match get_profile_internal(uuid).await {
        Ok(profile) => ServiceResponse {
            success: true,
            data: Some(profile),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_profile_internal(uuid: String) -> Result<ProfileData, String> {
    let prof_url = "http://localhost:3007".to_string();
    let sessionless = get_sessionless().await?;
    
    match ProfClient::new(prof_url) {
        Ok(prof_client) => {
            match prof_client.get_profile(sessionless, uuid.clone()).await {
                Ok(profile_response) => {
                    let profile = ProfileData {
                        uuid: uuid,
                        name: profile_response.get("name")
                            .and_then(|v| v.as_str())
                            .unwrap_or("Anonymous")
                            .to_string(),
                        email: profile_response.get("email")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string(),
                        bio: profile_response.get("bio")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        skills: profile_response.get("skills")
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect()),
                        website: profile_response.get("website")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        location: profile_response.get("location")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        image_url: profile_response.get("image_url")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        created_at: Utc::now(),
                        additional_fields: HashMap::new(),
                    };
                    
                    Ok(profile)
                }
                Err(e) => Err(format!("Failed to get profile: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create prof client: {}", e)),
    }
}

#[command]
pub async fn update_profile(
    profile_data: HashMap<String, serde_json::Value>,
    image_data: Option<String>
) -> ServiceResponse<ProfileData> {
    match update_profile_internal(profile_data, image_data).await {
        Ok(profile) => ServiceResponse {
            success: true,
            data: Some(profile),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn update_profile_internal(
    profile_data: HashMap<String, serde_json::Value>,
    image_data: Option<String>
) -> Result<ProfileData, String> {
    let prof_url = "http://localhost:3007".to_string();
    let sessionless = get_sessionless().await?;
    
    match ProfClient::new(prof_url) {
        Ok(prof_client) => {
            match prof_client.update_profile(sessionless, profile_data.clone(), image_data).await {
                Ok(profile_response) => {
                    let profile = ProfileData {
                        uuid: profile_data.get("uuid")
                            .and_then(|v| v.as_str())
                            .unwrap_or("unknown")
                            .to_string(),
                        name: profile_response.get("name")
                            .and_then(|v| v.as_str())
                            .unwrap_or("Anonymous")
                            .to_string(),
                        email: profile_response.get("email")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string(),
                        bio: profile_response.get("bio")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        skills: profile_response.get("skills")
                            .and_then(|v| v.as_array())
                            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect()),
                        website: profile_response.get("website")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        location: profile_response.get("location")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        image_url: profile_response.get("image_url")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string()),
                        created_at: Utc::now(),
                        additional_fields: HashMap::new(),
                    };
                    
                    Ok(profile)
                }
                Err(e) => Err(format!("Failed to update profile: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create prof client: {}", e)),
    }
}

#[command]
pub async fn delete_profile() -> ServiceResponse<bool> {
    match delete_profile_internal().await {
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

async fn delete_profile_internal() -> Result<bool, String> {
    let prof_url = "http://localhost:3007".to_string();
    let sessionless = get_sessionless().await?;
    
    match ProfClient::new(prof_url) {
        Ok(prof_client) => {
            match prof_client.delete_profile(sessionless).await {
                Ok(_) => Ok(true),
                Err(e) => Err(format!("Failed to delete profile: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create prof client: {}", e)),
    }
}

#[command]
pub async fn get_profile_image_url(uuid: String) -> ServiceResponse<String> {
    match get_profile_image_url_internal(uuid).await {
        Ok(url) => ServiceResponse {
            success: true,
            data: Some(url),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_profile_image_url_internal(uuid: String) -> Result<String, String> {
    let prof_url = "http://localhost:3007".to_string();
    let sessionless = get_sessionless().await?;
    
    match ProfClient::new(prof_url) {
        Ok(prof_client) => {
            match prof_client.get_profile_image_url(sessionless, uuid).await {
                Ok(url) => Ok(url),
                Err(e) => Err(format!("Failed to get profile image URL: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create prof client: {}", e)),
    }
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
    // For now, return development bases with profile and post counts
    
    let dev_base = BaseData {
        name: "DEV".to_string(),
        description: "Development base for testing social features.".to_string(),
        location: Some(LocationData {
            latitude: 36.788,
            longitude: -119.417,
            postal_code: Some("94102".to_string()),
        }),
        soma: Some(SomaData {
            lexary: Some(vec!["social".to_string(), "tech".to_string(), "programming".to_string()]),
            photary: Some(vec!["photos".to_string(), "social".to_string()]),
            viewary: Some(vec!["videos".to_string(), "social".to_string(), "entertainment".to_string()]),
        }),
        dns: Some(DnsData {
            bdo: "https://dev.bdo.allyabase.com/".to_string(),
            dolores: "https://dev.dolores.allyabase.com/".to_string(),
            prof: "http://localhost:3007".to_string(),
        }),
        joined: true,
        profile_count: 50, // Mock data - would be real in production
        post_count: 250,
    };

    let community_base = BaseData {
        name: "COMMUNITY".to_string(),
        description: "Community-run social base with diverse content.".to_string(),
        location: Some(LocationData {
            latitude: 40.7128,
            longitude: -74.0060,
            postal_code: Some("10001".to_string()),
        }),
        soma: Some(SomaData {
            lexary: Some(vec!["community".to_string(), "discussion".to_string(), "social".to_string()]),
            photary: Some(vec!["art".to_string(), "photography".to_string(), "social".to_string()]),
            viewary: Some(vec!["vlogs".to_string(), "community".to_string(), "social".to_string()]),
        }),
        dns: Some(DnsData {
            bdo: "https://community.bdo.allyabase.com/".to_string(),
            dolores: "https://community.dolores.allyabase.com/".to_string(),
            prof: "http://localhost:3007".to_string(),
        }),
        joined: false,
        profile_count: 125,
        post_count: 400,
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
    // Check if base is at capacity before joining
    let bases = get_bases_internal().await?;
    let base = bases.iter().find(|b| b.name == base_name)
        .ok_or_else(|| format!("Base {} not found", base_name))?;
    
    if base.profile_count >= MAX_PROFILES_PER_BASE {
        return Err(format!("Base {} is at capacity ({} profiles)", base_name, MAX_PROFILES_PER_BASE));
    }
    
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

#[command]
pub async fn get_base_profiles(base_name: String) -> ServiceResponse<Vec<ProfileData>> {
    match get_base_profiles_internal(base_name).await {
        Ok(profiles) => ServiceResponse {
            success: true,
            data: Some(profiles),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_base_profiles_internal(base_name: String) -> Result<Vec<ProfileData>, String> {
    // Mock profiles for development
    let mock_profiles = vec![
        ProfileData {
            uuid: "profile-1".to_string(),
            name: "Alice Developer".to_string(),
            email: "alice@example.com".to_string(),
            bio: Some("Software developer passionate about decentralized technology".to_string()),
            skills: Some(vec!["Rust".to_string(), "JavaScript".to_string(), "React".to_string()]),
            website: Some("https://alice.dev".to_string()),
            location: Some("San Francisco, CA".to_string()),
            image_url: Some("https://via.placeholder.com/150/4CAF50/FFFFFF?text=AD".to_string()),
            created_at: Utc::now() - chrono::Duration::days(30),
            additional_fields: HashMap::new(),
        },
        ProfileData {
            uuid: "profile-2".to_string(),
            name: "Bob Creator".to_string(),
            email: "bob@example.com".to_string(),
            bio: Some("Content creator and digital artist exploring new mediums".to_string()),
            skills: Some(vec!["Photography".to_string(), "Video Editing".to_string(), "Design".to_string()]),
            website: Some("https://bobcreates.com".to_string()),
            location: Some("Austin, TX".to_string()),
            image_url: Some("https://via.placeholder.com/150/2196F3/FFFFFF?text=BC".to_string()),
            created_at: Utc::now() - chrono::Duration::days(15),
            additional_fields: HashMap::new(),
        },
    ];
    
    println!("Getting profiles for base: {}", base_name);
    Ok(mock_profiles)
}

#[command]
pub async fn get_base_stats(base_name: String) -> ServiceResponse<BaseStats> {
    match get_base_stats_internal(base_name).await {
        Ok(stats) => ServiceResponse {
            success: true,
            data: Some(stats),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_base_stats_internal(base_name: String) -> Result<BaseStats, String> {
    let bases = get_bases_internal().await?;
    let base = bases.iter().find(|b| b.name == base_name)
        .ok_or_else(|| format!("Base {} not found", base_name))?;
    
    let stats = BaseStats {
        profile_count: base.profile_count,
        post_count: base.post_count,
        max_profiles: MAX_PROFILES_PER_BASE,
        max_posts: MAX_POSTS_PER_BASE,
        can_add_profile: base.profile_count < MAX_PROFILES_PER_BASE,
        can_add_post: base.post_count < MAX_POSTS_PER_BASE,
    };
    
    Ok(stats)
}

// Social feed management

#[command]
pub async fn get_social_feed(
    base_name: Option<String>,
    limit: Option<usize>,
    offset: Option<usize>
) -> ServiceResponse<SocialFeedData> {
    match get_social_feed_internal(base_name, limit, offset).await {
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

async fn get_social_feed_internal(
    _base_name: Option<String>,
    limit: Option<usize>,
    _offset: Option<usize>
) -> Result<SocialFeedData, String> {
    let limit = limit.unwrap_or(20);
    
    // Create mock social posts combining all types
    let mock_posts = create_mock_social_posts(limit).await?;
    
    let feed = SocialFeedData {
        posts: mock_posts.clone(),
        total_count: mock_posts.len(),
        has_more: mock_posts.len() >= limit,
    };
    
    Ok(feed)
}

async fn create_mock_social_posts(limit: usize) -> Result<Vec<SocialPost>, String> {
    let base_profiles = get_base_profiles_internal("DEV".to_string()).await?;
    
    let mut posts = Vec::new();
    
    // Create a mix of post types
    for i in 0..limit {
        let author = base_profiles[i % base_profiles.len()].clone();
        let post_type = match i % 3 {
            0 => PostType::Text,
            1 => PostType::Photo,
            _ => PostType::Video,
        };
        
        let content = match post_type {
            PostType::Text => PostContent::Text {
                title: Some(format!("Interesting thoughts #{}", i + 1)),
                content: format!("Just had some interesting thoughts about decentralized social networks and how they could change the way we interact online. What do you all think about the future of social media? Post {}", i + 1),
                tags: vec!["social".to_string(), "technology".to_string(), "decentralization".to_string()],
            },
            PostType::Photo => PostContent::Photo {
                title: Some(format!("Beautiful moment #{}", i + 1)),
                description: format!("Captured this amazing moment today! Nature never ceases to amaze me. Photo {}", i + 1),
                images: vec![
                    format!("https://picsum.photos/800/600?random={}", i * 3 + 1),
                    format!("https://picsum.photos/800/600?random={}", i * 3 + 2),
                ],
                tags: vec!["photography".to_string(), "nature".to_string(), "beautiful".to_string()],
            },
            PostType::Video => PostContent::Video {
                title: Some(format!("Cool video #{}", i + 1)),
                description: format!("Check out this cool video I made! Hope you enjoy it. Video {}", i + 1),
                url: format!("./sample-video-{}.mp4", i + 1),
                thumbnail: Some(format!("https://picsum.photos/800/450?random={}", i * 2)),
                duration: Some(60 + (i as u32 * 30) % 300),
                tags: vec!["video".to_string(), "creative".to_string(), "content".to_string()],
            },
        };
        
        let post = SocialPost {
            uuid: format!("post-{}", i + 1),
            post_type,
            author,
            content,
            timestamp: Utc::now() - chrono::Duration::hours(i as i64),
            likes: (i * 7 + 3) as u32 % 100,
            comments: (i * 3 + 1) as u32 % 20,
            shares: (i * 2) as u32 % 10,
        };
        
        posts.push(post);
    }
    
    Ok(posts)
}

#[command]
pub async fn refresh_social_feed(
    base_name: Option<String>,
    limit: Option<usize>
) -> ServiceResponse<SocialFeedData> {
    // Same as get_social_feed but could implement cache invalidation
    get_social_feed(base_name, limit, Some(0)).await
}

// Post creation commands

#[command]
pub async fn create_text_post(
    title: Option<String>,
    content: String,
    tags: Vec<String>
) -> ServiceResponse<SocialPost> {
    match create_text_post_internal(title, content, tags).await {
        Ok(post) => ServiceResponse {
            success: true,
            data: Some(post),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn create_text_post_internal(
    title: Option<String>,
    content: String,
    tags: Vec<String>
) -> Result<SocialPost, String> {
    let sessionless = get_sessionless().await?;
    
    // Get current user profile
    let profile = get_profile_internal(sessionless.uuid.clone()).await?;
    
    let post = SocialPost {
        uuid: format!("text-post-{}", uuid::Uuid::new_v4()),
        post_type: PostType::Text,
        author: profile,
        content: PostContent::Text { title, content, tags },
        timestamp: Utc::now(),
        likes: 0,
        comments: 0,
        shares: 0,
    };
    
    // In a real implementation, this would save to dolores/bdo
    println!("Created text post: {}", post.uuid);
    Ok(post)
}

#[command]
pub async fn create_photo_post(
    title: Option<String>,
    description: String,
    images: Vec<String>,
    tags: Vec<String>
) -> ServiceResponse<SocialPost> {
    match create_photo_post_internal(title, description, images, tags).await {
        Ok(post) => ServiceResponse {
            success: true,
            data: Some(post),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn create_photo_post_internal(
    title: Option<String>,
    description: String,
    images: Vec<String>,
    tags: Vec<String>
) -> Result<SocialPost, String> {
    let sessionless = get_sessionless().await?;
    
    // Get current user profile
    let profile = get_profile_internal(sessionless.uuid.clone()).await?;
    
    let post = SocialPost {
        uuid: format!("photo-post-{}", uuid::Uuid::new_v4()),
        post_type: PostType::Photo,
        author: profile,
        content: PostContent::Photo { title, description, images, tags },
        timestamp: Utc::now(),
        likes: 0,
        comments: 0,
        shares: 0,
    };
    
    // In a real implementation, this would save to dolores/bdo
    println!("Created photo post: {}", post.uuid);
    Ok(post)
}

#[command]
pub async fn create_video_post(
    title: Option<String>,
    description: String,
    url: String,
    thumbnail: Option<String>,
    duration: Option<u32>,
    tags: Vec<String>
) -> ServiceResponse<SocialPost> {
    match create_video_post_internal(title, description, url, thumbnail, duration, tags).await {
        Ok(post) => ServiceResponse {
            success: true,
            data: Some(post),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn create_video_post_internal(
    title: Option<String>,
    description: String,
    url: String,
    thumbnail: Option<String>,
    duration: Option<u32>,
    tags: Vec<String>
) -> Result<SocialPost, String> {
    let sessionless = get_sessionless().await?;
    
    // Get current user profile
    let profile = get_profile_internal(sessionless.uuid.clone()).await?;
    
    let post = SocialPost {
        uuid: format!("video-post-{}", uuid::Uuid::new_v4()),
        post_type: PostType::Video,
        author: profile,
        content: PostContent::Video { title, description, url, thumbnail, duration, tags },
        timestamp: Utc::now(),
        likes: 0,
        comments: 0,
        shares: 0,
    };
    
    // In a real implementation, this would save to dolores/bdo
    println!("Created video post: {}", post.uuid);
    Ok(post)
}

#[command]
pub async fn get_user_posts(user_uuid: String) -> ServiceResponse<Vec<SocialPost>> {
    match get_user_posts_internal(user_uuid).await {
        Ok(posts) => ServiceResponse {
            success: true,
            data: Some(posts),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_user_posts_internal(user_uuid: String) -> Result<Vec<SocialPost>, String> {
    // Filter posts by user from the mock feed
    let all_posts = create_mock_social_posts(50).await?;
    let user_posts: Vec<SocialPost> = all_posts
        .into_iter()
        .filter(|post| post.author.uuid == user_uuid)
        .collect();
    
    Ok(user_posts)
}

#[command]
pub async fn delete_post(post_uuid: String) -> ServiceResponse<bool> {
    match delete_post_internal(post_uuid).await {
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

async fn delete_post_internal(post_uuid: String) -> Result<bool, String> {
    // In a real implementation, this would delete from dolores/bdo
    println!("Deleted post: {}", post_uuid);
    Ok(true)
}

// User management commands (from other apps)

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
        "app": "mybase",
        "version": "0.0.1",
        "services": {
            "prof": "http://localhost:3007",
            "bdo": "https://dev.bdo.allyabase.com/",
            "dolores": "https://dev.dolores.allyabase.com/"
        },
        "limits": {
            "max_profiles_per_base": MAX_PROFILES_PER_BASE,
            "max_posts_per_base": MAX_POSTS_PER_BASE
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
    println!("MyBase Debug: {}", message);
    format!("Debug logged: {}", message)
}