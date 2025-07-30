use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use tauri::command;

// Planet Nine service clients
use prof_rs::{ProfClient, ProfileBuilder};
use sanora_rs::SanoraClient;
use covenant_rs::{CovenantClient, ContractBuilder};
use sessionless::{Sessionless, PrivateKey};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProfileData {
    pub name: String,
    pub email: String,
    pub bio: Option<String>,
    pub skills: Option<Vec<String>>,
    pub website: Option<String>,
    pub location: Option<String>,
    #[serde(flatten)]
    pub additional_fields: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductData {
    pub title: String,
    pub description: String,
    pub price: u64, // in cents
    pub tags: Vec<String>,
    pub category: String,
    pub preview_url: Option<String>,
    pub content_type: String, // "service", "digital_product", "consultation", etc.
    pub magical_contract: Option<ContractData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContractData {
    pub title: String,
    pub description: String,
    pub participants: Vec<String>,
    pub steps: Vec<ContractStepData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContractStepData {
    pub description: String,
    pub magic_spell: Option<serde_json::Value>,
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
pub async fn create_profile(profile_data: ProfileData, image_data: Option<String>) -> ServiceResponse<serde_json::Value> {
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

async fn create_profile_internal(profile_data: ProfileData, image_data: Option<String>) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    let prof_client = ProfClient::new("http://localhost:3007".to_string())
        .with_sessionless(sessionless);

    // Convert ProfileData to HashMap
    let mut profile_map = HashMap::new();
    profile_map.insert("name".to_string(), serde_json::Value::String(profile_data.name));
    profile_map.insert("email".to_string(), serde_json::Value::String(profile_data.email));
    
    if let Some(bio) = profile_data.bio {
        profile_map.insert("bio".to_string(), serde_json::Value::String(bio));
    }
    
    if let Some(skills) = profile_data.skills {
        profile_map.insert("skills".to_string(), serde_json::to_value(skills).unwrap());
    }
    
    if let Some(website) = profile_data.website {
        profile_map.insert("website".to_string(), serde_json::Value::String(website));
    }
    
    if let Some(location) = profile_data.location {
        profile_map.insert("location".to_string(), serde_json::Value::String(location));
    }
    
    // Add additional fields
    for (key, value) in profile_data.additional_fields {
        profile_map.insert(key, value);
    }

    // Handle image data if provided (base64 encoded)
    let image_data_bytes = if let Some(image_b64) = image_data {
        let image_bytes = base64::decode(image_b64).map_err(|e| format!("Invalid image data: {}", e))?;
        Some((image_bytes, "profile.jpg".to_string()))
    } else {
        None
    };

    let profile = prof_client.create_profile(profile_map, image_data_bytes).await
        .map_err(|e| format!("Failed to create profile: {}", e))?;

    Ok(serde_json::to_value(profile).unwrap())
}

#[command]
pub async fn get_profile(uuid: Option<String>) -> ServiceResponse<serde_json::Value> {
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

async fn get_profile_internal(uuid: Option<String>) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    let prof_client = ProfClient::new("http://localhost:3007".to_string())
        .with_sessionless(sessionless);

    let profile = prof_client.get_profile(uuid.as_deref()).await
        .map_err(|e| format!("Failed to get profile: {}", e))?;

    Ok(serde_json::to_value(profile).unwrap())
}

#[command]
pub async fn update_profile(profile_data: ProfileData, image_data: Option<String>) -> ServiceResponse<serde_json::Value> {
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

async fn update_profile_internal(profile_data: ProfileData, image_data: Option<String>) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    let prof_client = ProfClient::new("http://localhost:3007".to_string())
        .with_sessionless(sessionless);

    // Convert ProfileData to HashMap (similar to create_profile_internal)
    let mut profile_map = HashMap::new();
    profile_map.insert("name".to_string(), serde_json::Value::String(profile_data.name));
    profile_map.insert("email".to_string(), serde_json::Value::String(profile_data.email));
    
    if let Some(bio) = profile_data.bio {
        profile_map.insert("bio".to_string(), serde_json::Value::String(bio));
    }
    
    if let Some(skills) = profile_data.skills {
        profile_map.insert("skills".to_string(), serde_json::to_value(skills).unwrap());
    }
    
    if let Some(website) = profile_data.website {
        profile_map.insert("website".to_string(), serde_json::Value::String(website));
    }
    
    if let Some(location) = profile_data.location {
        profile_map.insert("location".to_string(), serde_json::Value::String(location));
    }
    
    for (key, value) in profile_data.additional_fields {
        profile_map.insert(key, value);
    }

    let image_data_bytes = if let Some(image_b64) = image_data {
        let image_bytes = base64::decode(image_b64).map_err(|e| format!("Invalid image data: {}", e))?;
        Some((image_bytes, "profile.jpg".to_string()))
    } else {
        None
    };

    let profile = prof_client.update_profile(profile_map, image_data_bytes).await
        .map_err(|e| format!("Failed to update profile: {}", e))?;

    Ok(serde_json::to_value(profile).unwrap())
}

#[command]
pub async fn delete_profile() -> ServiceResponse<bool> {
    match delete_profile_internal().await {
        Ok(()) => ServiceResponse {
            success: true,
            data: Some(true),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn delete_profile_internal() -> Result<(), String> {
    let sessionless = get_sessionless().await?;
    let prof_client = ProfClient::new("http://localhost:3007".to_string())
        .with_sessionless(sessionless);

    prof_client.delete_profile().await
        .map_err(|e| format!("Failed to delete profile: {}", e))?;

    Ok(())
}

#[command]
pub async fn get_profile_image_url(uuid: Option<String>) -> ServiceResponse<String> {
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

async fn get_profile_image_url_internal(uuid: Option<String>) -> Result<String, String> {
    let sessionless = get_sessionless().await?;
    let prof_client = ProfClient::new("http://localhost:3007".to_string())
        .with_sessionless(sessionless);

    let url = prof_client.get_profile_image_url(uuid.as_deref())
        .map_err(|e| format!("Failed to get profile image URL: {}", e))?;

    Ok(url)
}

// Product management commands (Sanora integration)

#[command]
pub async fn create_product(product_data: ProductData) -> ServiceResponse<serde_json::Value> {
    match create_product_internal(product_data).await {
        Ok(product) => ServiceResponse {
            success: true,
            data: Some(product),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn create_product_internal(product_data: ProductData) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    let sanora_client = SanoraClient::new("http://localhost:7243".to_string(), sessionless.clone());

    // Create product with tags
    let mut product_description = product_data.description.clone();
    if !product_data.tags.is_empty() {
        product_description.push_str("\n\nTags: ");
        product_description.push_str(&product_data.tags.join(", "));
    }

    let product = sanora_client.add_product(
        product_data.title.clone(),
        product_description,
        product_data.price,
    ).await.map_err(|e| format!("Failed to create product: {}", e))?;

    // Create magical contract if provided
    let mut contract_uuid: Option<String> = None;
    if let Some(contract_data) = product_data.magical_contract {
        let covenant_client = CovenantClient::new("http://localhost:3011".to_string(), Some(sessionless.clone()))
            .map_err(|e| format!("Failed to create covenant client: {}", e))?;

        let contract_builder = ContractBuilder::new()
            .title(contract_data.title)
            .description(contract_data.description)
            .participants(contract_data.participants)
            .product_uuid(product.get("uuid").and_then(|v| v.as_str()).unwrap_or("").to_string());

        let contract_builder = contract_data.steps.into_iter().fold(contract_builder, |builder, step| {
            match step.magic_spell {
                Some(spell) => builder.step_with_magic(step.description, spell),
                None => builder.step(step.description),
            }
        });

        let contract = covenant_client.create_contract(&contract_builder).await
            .map_err(|e| format!("Failed to create magical contract: {}", e))?;

        contract_uuid = Some(contract.uuid);
    }

    // Store additional metadata (tags, category, etc.) - in a real implementation,
    // you might want to extend Sanora to support these natively
    let mut product_json = serde_json::to_value(product).unwrap();
    if let Some(product_obj) = product_json.as_object_mut() {
        product_obj.insert("tags".to_string(), serde_json::to_value(product_data.tags)?);
        product_obj.insert("category".to_string(), serde_json::Value::String(product_data.category));
        product_obj.insert("content_type".to_string(), serde_json::Value::String(product_data.content_type));
        if let Some(preview_url) = product_data.preview_url {
            product_obj.insert("preview_url".to_string(), serde_json::Value::String(preview_url));
        }
        if let Some(contract_id) = contract_uuid {
            product_obj.insert("contract_uuid".to_string(), serde_json::Value::String(contract_id));
        }
    }

    Ok(product_json)
}

#[command]
pub async fn get_user_products() -> ServiceResponse<serde_json::Value> {
    match get_user_products_internal().await {
        Ok(products) => ServiceResponse {
            success: true,
            data: Some(products),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_user_products_internal() -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    let sanora_client = SanoraClient::new("http://localhost:7243".to_string(), sessionless);

    let user_data = sanora_client.get_user().await
        .map_err(|e| format!("Failed to get user products: {}", e))?;

    Ok(serde_json::to_value(user_data).unwrap())
}

#[command]
pub async fn get_products_by_tags(tags: Vec<String>) -> ServiceResponse<Vec<serde_json::Value>> {
    match get_products_by_tags_internal(tags).await {
        Ok(products) => ServiceResponse {
            success: true,
            data: Some(products),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_products_by_tags_internal(tags: Vec<String>) -> Result<Vec<serde_json::Value>, String> {
    // This is a placeholder implementation. In a real system, you'd want to:
    // 1. Extend Sanora to support tag-based queries
    // 2. Or implement a separate indexing service
    // 3. Or query multiple users and filter by tags
    
    // For now, return mock data filtered by tags
    let mock_products = vec![
        serde_json::json!({
            "id": "1",
            "title": "Web Development Services",
            "description": "Custom web development using modern technologies",
            "price": 5000,
            "tags": ["web", "development", "javascript", "react"],
            "category": "service",
            "content_type": "service",
            "author": "John Developer",
            "author_uuid": "dev-1"
        }),
        serde_json::json!({
            "id": "2", 
            "title": "UI/UX Design Consultation",
            "description": "Professional UI/UX design consultation and planning",
            "price": 15000,
            "tags": ["design", "ui", "ux", "consultation"],
            "category": "consultation",
            "content_type": "consultation",
            "author": "Jane Designer",
            "author_uuid": "des-1"
        }),
        serde_json::json!({
            "id": "3",
            "title": "React Component Library",
            "description": "Reusable React components for rapid development",
            "price": 2500,
            "tags": ["react", "components", "javascript", "development"],
            "category": "digital_product",
            "content_type": "digital_product",
            "author": "Alex Coder",
            "author_uuid": "cod-1"
        }),
        serde_json::json!({
            "id": "4",
            "title": "Photography Portfolio Session",
            "description": "Professional photography for your portfolio",
            "price": 30000,
            "tags": ["photography", "portfolio", "creative", "professional"],
            "category": "service",
            "content_type": "service",
            "author": "Maria Photographer",
            "author_uuid": "pho-1"
        }),
        serde_json::json!({
            "id": "5",
            "title": "Digital Marketing Course",
            "description": "Complete digital marketing course with practical examples",
            "price": 9900,
            "tags": ["marketing", "digital", "course", "education"],
            "category": "course",
            "content_type": "course",
            "author": "Tom Marketer",
            "author_uuid": "mar-1"
        })
    ];

    // Filter products by tags
    let filtered_products: Vec<serde_json::Value> = mock_products
        .into_iter()
        .filter(|product| {
            if let Some(product_tags) = product.get("tags").and_then(|t| t.as_array()) {
                tags.iter().any(|tag| {
                    product_tags.iter().any(|pt| {
                        pt.as_str().map_or(false, |s| s.to_lowercase().contains(&tag.to_lowercase()))
                    })
                })
            } else {
                false
            }
        })
        .collect();

    Ok(filtered_products)
}

#[command]
pub async fn update_product(product_id: String, product_data: ProductData) -> ServiceResponse<serde_json::Value> {
    match update_product_internal(product_id, product_data).await {
        Ok(product) => ServiceResponse {
            success: true,
            data: Some(product),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn update_product_internal(product_id: String, product_data: ProductData) -> Result<serde_json::Value, String> {
    // Placeholder implementation - would need to extend Sanora for product updates
    Ok(serde_json::json!({
        "id": product_id,
        "title": product_data.title,
        "description": product_data.description,
        "price": product_data.price,
        "tags": product_data.tags,
        "category": product_data.category,
        "content_type": product_data.content_type,
        "updated": true
    }))
}

#[command]
pub async fn delete_product(product_id: String) -> ServiceResponse<bool> {
    match delete_product_internal(product_id).await {
        Ok(()) => ServiceResponse {
            success: true,
            data: Some(true),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn delete_product_internal(_product_id: String) -> Result<(), String> {
    // Placeholder implementation - would need to extend Sanora for product deletion  
    Ok(())
}

// Magical contract management commands

#[command]
pub async fn create_contract(contract_data: ContractData) -> ServiceResponse<serde_json::Value> {
    match create_contract_internal(contract_data).await {
        Ok(contract) => ServiceResponse {
            success: true,
            data: Some(contract),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn create_contract_internal(contract_data: ContractData) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    let covenant_client = CovenantClient::new("http://localhost:3011".to_string(), Some(sessionless))
        .map_err(|e| format!("Failed to create covenant client: {}", e))?;

    let contract_builder = ContractBuilder::new()
        .title(contract_data.title)
        .description(contract_data.description)
        .participants(contract_data.participants);

    let contract_builder = contract_data.steps.into_iter().fold(contract_builder, |builder, step| {
        match step.magic_spell {
            Some(spell) => builder.step_with_magic(step.description, spell),
            None => builder.step(step.description),
        }
    });

    let contract = covenant_client.create_contract(&contract_builder).await
        .map_err(|e| format!("Failed to create contract: {}", e))?;

    Ok(serde_json::to_value(contract).unwrap())
}

#[command]
pub async fn get_contract(uuid: String) -> ServiceResponse<serde_json::Value> {
    match get_contract_internal(uuid).await {
        Ok(contract) => ServiceResponse {
            success: true,
            data: Some(contract),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_contract_internal(uuid: String) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    let covenant_client = CovenantClient::new("http://localhost:3011".to_string(), Some(sessionless))
        .map_err(|e| format!("Failed to create covenant client: {}", e))?;

    let contract = covenant_client.get_contract(&uuid).await
        .map_err(|e| format!("Failed to get contract: {}", e))?;

    Ok(serde_json::to_value(contract).unwrap())
}

#[command]
pub async fn sign_contract_step(contract_uuid: String, step_id: String, message: Option<String>) -> ServiceResponse<serde_json::Value> {
    match sign_contract_step_internal(contract_uuid, step_id, message).await {
        Ok(result) => ServiceResponse {
            success: true,
            data: Some(result),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn sign_contract_step_internal(contract_uuid: String, step_id: String, message: Option<String>) -> Result<serde_json::Value, String> {
    let sessionless = get_sessionless().await?;
    let covenant_client = CovenantClient::new("http://localhost:3011".to_string(), Some(sessionless))
        .map_err(|e| format!("Failed to create covenant client: {}", e))?;

    let result = covenant_client.sign_step(&contract_uuid, &step_id, message.as_deref()).await
        .map_err(|e| format!("Failed to sign contract step: {}", e))?;

    Ok(serde_json::to_value(result).unwrap())
}

#[command]
pub async fn get_my_contracts() -> ServiceResponse<Vec<serde_json::Value>> {
    match get_my_contracts_internal().await {
        Ok(contracts) => ServiceResponse {
            success: true,
            data: Some(contracts),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_my_contracts_internal() -> Result<Vec<serde_json::Value>, String> {
    let sessionless = get_sessionless().await?;
    let covenant_client = CovenantClient::new("http://localhost:3011".to_string(), Some(sessionless))
        .map_err(|e| format!("Failed to create covenant client: {}", e))?;

    let contracts = covenant_client.get_my_contracts().await
        .map_err(|e| format!("Failed to get my contracts: {}", e))?;

    Ok(contracts.into_iter().map(|c| serde_json::to_value(c).unwrap()).collect())
}

#[command]
pub async fn get_contract_svg(uuid: String, theme: Option<String>, width: Option<u32>, height: Option<u32>) -> ServiceResponse<String> {
    match get_contract_svg_internal(uuid, theme, width, height).await {
        Ok(svg) => ServiceResponse {
            success: true,
            data: Some(svg),
            error: None,
        },
        Err(e) => ServiceResponse {
            success: false,
            data: None,
            error: Some(e),
        },
    }
}

async fn get_contract_svg_internal(uuid: String, theme: Option<String>, width: Option<u32>, height: Option<u32>) -> Result<String, String> {
    let sessionless = get_sessionless().await?;
    let covenant_client = CovenantClient::new("http://localhost:3011".to_string(), Some(sessionless))
        .map_err(|e| format!("Failed to create covenant client: {}", e))?;

    let svg = covenant_client.get_contract_svg(&uuid, theme.as_deref(), width, height).await
        .map_err(|e| format!("Failed to get contract SVG: {}", e))?;

    Ok(svg)
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
        "app": "idothis",
        "version": "0.0.1",
        "services": {
            "prof": "http://localhost:3007",
            "sanora": "http://localhost:7243"
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
    println!("IDothis Debug: {}", message);
    format!("Debug logged: {}", message)
}