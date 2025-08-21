use addie_rs::structs::{PaymentIntent, Payee};
use addie_rs::Addie;
use bdo_rs::structs::BDOUser;
use bdo_rs::BDO;
use dolores_rs::structs::Feed;
use dolores_rs::{Dolores, DoloresUser};
use fount_rs::{Fount, FountUser};
use sanora_rs::structs::{Order, SanoraUser, ProductMeta};
use sanora_rs::{Orders, Sanora};
use reqwest::Client;
use serde_json::json;
use serde_json::{Map, Value};
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
use std::env;
use std::time::SystemTime;
use std::fs;
use std::path::Path;
use chrono::Utc;

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
    env::var("NINEFY_ENV").unwrap_or_else(|_| "dev".to_string())
}

/// Get service URL based on environment and service name
fn get_service_url(service: &str) -> String {
    let env = env::var("NINEFY_ENV").unwrap_or_else(|_| "dev".to_string());
    
    match (env.as_str(), service) {
        // Test environment (127.0.0.1:5111-5122)
        ("test", "julia") => "http://127.0.0.1:5111/".to_string(),
        ("test", "continuebee") => "http://127.0.0.1:5112/".to_string(),
        ("test", "pref") => "http://127.0.0.1:5113/".to_string(),
        ("test", "bdo") => "http://127.0.0.1:5114/".to_string(),
        ("test", "joan") => "http://127.0.0.1:5115/".to_string(),
        ("test", "addie") => "http://127.0.0.1:5116/".to_string(),
        ("test", "fount") => "http://127.0.0.1:5117/".to_string(),
        ("test", "dolores") => "http://127.0.0.1:5118/".to_string(),
        ("test", "minnie") => "http://127.0.0.1:5119/".to_string(),
        ("test", "aretha") => "http://127.0.0.1:5120/".to_string(),
        ("test", "sanora") => "http://127.0.0.1:5121/".to_string(),
        ("test", "covenant") => "http://127.0.0.1:5122/".to_string(),
        
        // Local environment (127.0.0.1:3000-3011)
        ("local", "julia") => "http://127.0.0.1:3000/".to_string(),
        ("local", "continuebee") => "http://127.0.0.1:2999/".to_string(),
        ("local", "fount") => "http://127.0.0.1:3002/".to_string(),
        ("local", "bdo") => "http://127.0.0.1:3003/".to_string(),
        ("local", "pref") => "http://127.0.0.1:3004/".to_string(),
        ("local", "addie") => "http://127.0.0.1:3005/".to_string(),
        ("local", "dolores") => "http://127.0.0.1:3005/".to_string(),
        ("local", "joan") => "http://127.0.0.1:3004/".to_string(),
        ("local", "aretha") => "http://127.0.0.1:7277/".to_string(),
        ("local", "minnie") => "http://127.0.0.1:2525/".to_string(),
        ("local", "sanora") => "http://127.0.0.1:7243/".to_string(),
        ("local", "covenant") => "http://127.0.0.1:3011/".to_string(),
        
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

/// Sign a message using sessionless
async fn sign_message(message: String) -> Result<String, String> {
    let sessionless = get_sessionless().await?;
    let signature = sessionless.sign(&message);
    Ok(signature.into_hex())
}

/// Create a new Fount user for MAGIC transactions
#[tauri::command]
async fn create_fount_user() -> Result<FountUser, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let fount = Fount::new(
                Some(get_service_url("fount")),
                Some(sessionless),
            );
            let _user = fount.create_user().await;
            dbg!(&_user);
            return match _user {
                Ok(user) => Ok(user),
                Err(_) => Err("no user".to_string()),
            };
        }
        Err(_) => Err("no user".to_string()),
    }
}

/// Create a new BDO user for big dumb object storage
#[tauri::command]
async fn create_bdo_user() -> Result<BDOUser, String> {
    let s = get_sessionless().await;
    let ninefy = "ninefy";
    
    // Get BDO URL based on environment
    let bdo_url = get_service_url("bdo");
    let env = env::var("NINEFY_ENV").unwrap_or_else(|_| "dev".to_string());
    
    println!("🔗 Creating BDO user on: {} (env: {})", bdo_url, env);
    
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(
                Some(bdo_url),
                Some(sessionless),
            );
            let _user = bdo.create_user(&ninefy, &json!({}), &false).await;
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
    let ninefy = "ninefy";
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(Some(bdo_url.to_string()), Some(sessionless));
            let bases_result = bdo.get_bases(&uuid, &ninefy).await;

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

/// Create payment intent with splits for multiple payees
#[tauri::command(rename_all = "snake_case")]
async fn get_payment_intent_with_splits(
    amount: u32,
    currency: &str,
    payees: Vec<Payee>
) -> Result<PaymentIntent, String> {
    let s = get_sessionless().await;
    let stripe = "stripe";

    match s {
        Ok(sessionless) => {
            let addie = Addie::new(
                Some(get_service_url("addie")),
                Some(sessionless),
            );
            let addie_user = match addie.create_user().await {
                Ok(user) => user,
                Err(_) => {
                    dbg!("The problem is getting the user");
                    return Ok(PaymentIntent::new());
                }
            };

            match addie
                .get_payment_intent(&addie_user.uuid, &stripe, &amount, &currency, &payees)
                .await
            {
                Ok(intent) => Ok(intent),
                Err(err) => {
                    dbg!("the intent failed for some reason {}", err);
                    return Ok(PaymentIntent::new());
                }
            }
        }
        Err(_) => Ok(PaymentIntent::new()),
    }
}

/// Create payment intent without splits for single payee
#[tauri::command(rename_all = "snake_case")]
async fn get_payment_intent_without_splits(
    amount: u32,
    currency: &str,
) -> Result<PaymentIntent, String> {
    let s = get_sessionless().await;
    let stripe = "stripe";

    match s {
        Ok(sessionless) => {
            let addie = Addie::new(
                Some(get_service_url("addie")),
                Some(sessionless),
            );
            let addie_user = match addie.create_user().await {
                Ok(user) => user,
                Err(_) => {
                    dbg!("The problem is getting the user");
                    return Ok(PaymentIntent::new());
                }
            };

            match addie
                .get_payment_intent_without_splits(&addie_user.uuid, &stripe, &amount, &currency)
                .await
            {
                Ok(intent) => Ok(intent),
                Err(err) => {
                    dbg!("the intent failed for some reason {}", err);
                    return Ok(PaymentIntent::new());
                }
            }
        }
        Err(_) => Ok(PaymentIntent::new()),
    }
}

/// Create a new Dolores user for video/media storage
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

/// Get media feed from Dolores with specific tags
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

/// Create a new Sanora user for blog product hosting
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

/// Get orders for a specific blog product
#[tauri::command]
async fn get_orders_for_product_id(uuid: &str, sanora_url: &str, product_id: &str) -> Result<Orders, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            let orders_result = sanora.get_orders_for_product_id(&uuid, &product_id).await;
        
            match orders_result {
                Ok(orders) => Ok(orders),
                Err(e) => {
                    dbg!(e);
                    Err("failed to get orders".to_string())
                }
            }
        }
        Err(_) => Err("no sanora".to_string()),
    }
}

/// Add an order for a blog product
#[tauri::command]
async fn add_order(uuid: &str, sanora_url: &str, order: Order) -> Result<SanoraUser, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            let order_result = sanora.add_order(&uuid, &order).await;

            match order_result {
                Ok(user) => Ok(user),
                Err(e) => {
                    dbg!(e);
                    Err("failed to add order".to_string())
                }
            }
        }
        Err(_) => Err("no sanora".to_string()),
    }
}

#[tauri::command]
async fn add_product(uuid: &str, sanora_url: &str, title: &str, description: &str, price: u32, category: &str) -> Result<ProductMeta, String> {
    println!("🦀 Rust add_product called with: uuid={}, sanora_url={}, title={}, price={}, category={:?}", 
             uuid, sanora_url, title, price, category);
    
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            println!("🦀 Calling sanora.add_product with sessionless authentication");
            let product_result = sanora.add_product(&uuid, &title, &description, &price, &category).await;

            match product_result {
                Ok(meta) => {
                    println!("🦀 ✅ Product added successfully: {:?}", meta);
                   
                    Ok(meta)
                },
                Err(e) => {
                    println!("🦀 ❌ Failed to add product: {:?}", e);
                    dbg!(e);
                    Err("failed to add product".to_string())
                }
            }
        }
        Err(_) => {
            println!("🦀 ❌ Failed to get sessionless instance");
            Err("no sanora".to_string())
        }
    }
}

/// Get Sanora user information (which includes their products)
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

/// Toggle product availability (placeholder - not yet implemented in sanora_rs)
#[tauri::command]
async fn toggle_product_availability(
    _uuid: &str, 
    _sanora_url: &str, 
    _product_id: &str, 
    available: bool
) -> Result<Value, String> {
    // NOTE: This function is a placeholder because toggle_product_availability 
    // doesn't exist in the current sanora_rs crate. In a real implementation,
    // this would either:
    // 1. Use HTTP calls to a custom endpoint
    // 2. Be implemented as product metadata updates
    // 3. Require extending the sanora_rs crate
    
    println!("🔄 Toggle product availability called (placeholder): {}", available);
    
    // Return a mock success response for now
    Ok(json!({
        "success": true,
        "available": available,
        "message": "Product availability toggle is not yet implemented"
    }))
}

/// Upload image to Sanora with sessionless authentication
#[tauri::command]
async fn upload_image(file_data: Vec<u8>, file_name: String, url: String, message: String, timestamp: String) -> Result<String, String> {
    println!("🦀 Rust uploading image: {} to: {} with message: {}", file_name, url, message);

    let signature = sign_message(message).await?;

    let client = Client::new();

    // Get extension from file name
    let extension = file_name.split('.').last().unwrap_or("jpg");

    let mime_type = match extension.to_lowercase().as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        _ => "image/jpeg", // default
    };

    // Create multipart form - just like the server test
    let part = reqwest::multipart::Part::bytes(file_data)
        .file_name(file_name.clone())
        .mime_str(mime_type)
        .map_err(|e| format!("Failed to create multipart form: {}", e))?;

    let form = reqwest::multipart::Form::new()
        .part("image", part);

    let response = client
        .put(&url)
        .header("Accept", "application/json")
        .header("x-pn-timestamp", &timestamp)
        .header("x-pn-signature", &signature)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();

    if status.is_success() {
        let body = response.text().await
            .map_err(|e| format!("Failed to read response body: {}", e))?;
        println!("🦀 Image upload success: {}", body);
        Ok(body)
    } else {
        let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        println!("❌ Image upload error {}: {}", status.as_u16(), error_body);
        Err(format!("HTTP error {}: {}", status.as_u16(), error_body))
    }
}

/// Upload artifact to Sanora with sessionless authentication
#[tauri::command]
async fn upload_artifact(file_data: Vec<u8>, file_name: String, url: String, message: String, timestamp: String, artifact_type: String) -> Result<String, String> {
    println!("🦀 Rust uploading artifact: {} to: {} with message: {}", file_name, url, message);

    let signature = sign_message(message).await?;

    let client = Client::new();

    // Get extension from file name
    let extension = file_name.split('.').last().unwrap_or("bin");

    let mime_type = match extension.to_lowercase().as_str() {
        "pdf" => "application/pdf",
        "epub" => "application/epub+zip",
        "mobi" => "application/x-mobipocket-ebook",
        "txt" => "text/plain",
        "zip" => "application/zip",
        "mp3" => "audio/mpeg",
        "mp4" => "video/mp4",
        "exe" => "application/octet-stream",
        _ => "application/octet-stream", // default
    };

    // Create multipart form
    let part = reqwest::multipart::Part::bytes(file_data)
        .file_name(file_name.clone())
        .mime_str(mime_type)
        .map_err(|e| format!("Failed to create multipart form: {}", e))?;

    let form = reqwest::multipart::Form::new()
        .part("artifact", part);

    let response = client
        .put(&url)
        .header("Accept", "application/json")
        .header("x-pn-timestamp", &timestamp)
        .header("x-pn-signature", &signature)
        .header("x-pn-artifact-type", &artifact_type)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = response.status();

    if status.is_success() {
        let body = response.text().await
            .map_err(|e| format!("Failed to read response body: {}", e))?;
        println!("🦀 Artifact upload success: {}", body);
        Ok(body)
    } else {
        let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        println!("❌ Artifact upload error {}: {}", status.as_u16(), error_body);
        Err(format!("HTTP error {}: {}", status.as_u16(), error_body))
    }
}

/// Get artifact content from Sanora
#[tauri::command]
async fn get_artifact(_uuid: &str, sanora_url: &str, product_title: &str, artifact_id: &str) -> Result<String, String> {
    println!("🔍 Getting artifact: {} for product: {} from: {}", artifact_id, product_title, sanora_url);
    
    let client = Client::new();
    
    // Construct the correct artifact URL format: /artifacts/{artifact_id}
    let artifact_url = format!("{}/artifacts/{}", 
                              sanora_url.trim_end_matches('/'), 
                              artifact_id);
    
    println!("📥 Fetching artifact from: {}", artifact_url);
    
    match client.get(&artifact_url).send().await {
        Ok(response) => {
            let status = response.status();
            println!("📡 Artifact response status: {}", status);
            
            if status.is_success() {
                match response.text().await {
                    Ok(content) => {
                        println!("✅ Got artifact content ({} bytes)", content.len());
                        Ok(content)
                    }
                    Err(e) => {
                        println!("❌ Failed to read artifact content: {}", e);
                        Err(format!("Failed to read artifact content: {}", e))
                    }
                }
            } else {
                let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                println!("❌ HTTP error {}: {}", status.as_u16(), error_body);
                Err(format!("HTTP error {}: {}", status.as_u16(), error_body))
            }
        }
        Err(e) => {
            println!("❌ Request failed: {}", e);
            Err(format!("Request failed: {}", e))
        }
    }
}

/// Get all products available on the entire base (new /products/base endpoint)
#[tauri::command]
async fn get_all_base_products(sanora_url: &str) -> Result<Value, String> {
    println!("🔄 Getting ALL base products from: {}", sanora_url);
    
    let client = Client::new();
    
    // Use the new /products/base endpoint (no authentication required)
    let products_url = format!("{}/products/base", sanora_url.trim_end_matches('/'));
    
    println!("🔍 Trying base products endpoint: {}", products_url);
    
    match client.get(&products_url).send().await {
        Ok(response) => {
            let status = response.status();
            println!("📡 Response status: {}", status);
            
            if status.is_success() {
                match response.text().await {
                    Ok(body) => {
                        println!("📄 Response body: {}", body);
                        
                        // Try to parse as JSON
                        match serde_json::from_str::<Value>(&body) {
                            Ok(json_value) => {
                                println!("✅ Got products JSON from base endpoint");
                                Ok(json_value)
                            }
                            Err(_) => {
                                // If it's not JSON, return it as a string in an array
                                println!("⚠️ Response is not JSON, wrapping as string");
                                Ok(json!([{"response": body}]))
                            }
                        }
                    }
                    Err(e) => {
                        println!("❌ Failed to read response body: {}", e);
                        Err(format!("Failed to read response: {}", e))
                    }
                }
            } else {
                let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                println!("❌ HTTP error {}: {}", status.as_u16(), error_body);
                
                // Instead of failing, return empty array for now
                println!("⚠️ Returning empty array due to HTTP error");
                Ok(json!([]))
            }
        }
        Err(e) => {
            println!("❌ Request failed: {}", e);
            Err(format!("Request failed: {}", e))
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
            let ninefy = "ninefy";
            let bdo_user = match bdo.create_user(&ninefy, &json!({}), &false).await {
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
            match bdo.teleport(&bdo_user.uuid, &ninefy, teleport_url).await {
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

/// Get all products available on a base (HTTP-based implementation) - DEPRECATED
#[tauri::command]
async fn get_base_products(sanora_url: &str, user_uuid: Option<String>) -> Result<Value, String> {
    println!("🔄 Getting base products from: {}", sanora_url);
    
    let client = Client::new();
    
    // Use provided user UUID, or try to create/get one
    let uuid = match user_uuid {
        Some(uuid) => uuid,
        None => {
            // If no UUID provided, try to create a user first
            println!("🔍 No user UUID provided, creating Sanora user...");
            match create_sanora_user(sanora_url).await {
                Ok(user) => {
                    println!("✅ Created user with UUID: {}", user.uuid);
                    user.uuid
                }
                Err(e) => {
                    println!("❌ Failed to create user: {}", e);
                    return Err(format!("Failed to create user: {}", e));
                }
            }
        }
    };
    
    // The correct endpoint pattern from the test is: GET /products/{uuid}
    let products_url = format!("{}/products/{}", sanora_url.trim_end_matches('/'), uuid);
    
    println!("🔍 Trying user products endpoint: {}", products_url);
    
    match client.get(&products_url).send().await {
        Ok(response) => {
            let status = response.status();
            println!("📡 Response status: {}", status);
            
            if status.is_success() {
                match response.text().await {
                    Ok(body) => {
                        println!("📄 Response body: {}", body);
                        
                        // Try to parse as JSON
                        match serde_json::from_str::<Value>(&body) {
                            Ok(json_value) => {
                                println!("✅ Got products JSON from user endpoint");
                                Ok(json_value)
                            }
                            Err(_) => {
                                // If it's not JSON, return it as a string in an array
                                println!("⚠️ Response is not JSON, wrapping as string");
                                Ok(json!([{"response": body}]))
                            }
                        }
                    }
                    Err(e) => {
                        println!("❌ Failed to read response body: {}", e);
                        Err(format!("Failed to read response: {}", e))
                    }
                }
            } else {
                let error_body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                println!("❌ HTTP error {}: {}", status.as_u16(), error_body);
                
                // Instead of failing, return empty array for now
                println!("⚠️ Returning empty array due to HTTP error");
                Ok(json!([]))
            }
        }
        Err(e) => {
            println!("❌ Request failed: {}", e);
            Err(format!("Request failed: {}", e))
        }
    }
}


/// Generate unique keys for menu cards and save to JSON file
#[tauri::command]
async fn generate_menu_card_keys(menu_name: &str, card_count: usize) -> Result<Vec<String>, String> {
    println!("🔑 Generating {} unique keys for menu: {}", card_count, menu_name);
    
    let mut card_keys = Vec::new();
    let mut key_data = Map::new();
    
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
    
    // Save to JSON file
    let safe_menu_name = menu_name.replace(|c: char| !c.is_alphanumeric() && c != '_' && c != '-', "_");
    let file_name = format!("{}Keys.json", safe_menu_name);
    
    // Save in app data directory
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".ninefy").join("menu-keys"),
        Err(_) => Path::new(".").join("ninefy_data").join("menu-keys"),
    };
    
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create keys directory: {}", e))?;
    
    let file_path = app_dir.join(&file_name);
    let keys_json = json!({
        "menu_name": menu_name,
        "created_at": Utc::now().to_rfc3339(),
        "card_count": card_count,
        "keys": key_data
    });
    
    fs::write(&file_path, serde_json::to_string_pretty(&keys_json).unwrap())
        .map_err(|e| format!("Failed to save keys file: {}", e))?;
    
    println!("✅ Saved {} keys to: {:?}", card_count, file_path);
    
    // ===== COMPREHENSIVE KEY GENERATION SUMMARY =====
    println!("\n🔑 ===== COMPREHENSIVE KEY GENERATION SUMMARY =====");
    println!("📋 Menu: {}", menu_name);
    println!("🎴 Total Keys Generated: {}", card_count);
    println!("💾 Keys File: {:?}", file_path);
    println!("🔑 All Generated PubKeys (for BDO storage):");
    for (i, key) in card_keys.iter().enumerate() {
        println!("   {}. Card {} → {}", i + 1, i, key);
    }
    println!("✅ Each key corresponds to a unique BDO user for MagiCard storage");
    println!("🔑 ================================================\n");
    
    Ok(card_keys)
}

/// Store an individual card in BDO with its own unique user
#[tauri::command]
async fn store_card_in_bdo(card_bdo_pub_key: &str, card_name: &str, svg_content: &str, card_type: &str, menu_name: &str) -> Result<String, String> {
    println!("🗄️ Storing card in BDO: {} (type: {}) with pubKey: {}... from menu: {}", card_name, card_type, &card_bdo_pub_key[..12], menu_name);
    
    // Load the private key for this card from the saved keys file
    let card_private_key = match load_card_private_key(menu_name, card_bdo_pub_key).await {
        Ok(private_key) => private_key,
        Err(e) => {
            println!("⚠️ Could not load private key for card {}: {}. Using generated key.", card_name, e);
            // Generate a unique private key as fallback
            generate_unique_private_key()
        }
    };
    
    println!("🔑 Using private key for card {}: {}...", card_name, &card_private_key[..12]);
    
    let bdo_url = get_service_url("bdo");
    let env = env::var("NINEFY_ENV").unwrap_or_else(|_| "dev".to_string());
    
    println!("🔗 Using BDO URL: {} (env: {})", bdo_url, env);
    
    // Create a sessionless instance using the card's unique private key
    let sessionless = match PrivateKey::from_hex(&card_private_key) {
        Ok(private_key) => Sessionless::from_private_key(private_key),
        Err(e) => {
            println!("❌ Failed to create private key from hex: {}", e);
            return Err(format!("Invalid private key: {}", e));
        }
    };
    
    // Verify the public key matches
    let generated_pub_key = sessionless.public_key().to_hex();
    if generated_pub_key != card_bdo_pub_key {
        println!("⚠️ Public key mismatch! Generated: {}, Expected: {}", &generated_pub_key[..12], &card_bdo_pub_key[..12]);
        // Continue anyway, but log the mismatch
    }
    
    let bdo = BDO::new(Some(bdo_url), Some(sessionless));
    
    // Create a unique context for this card
    let card_context = format!("magicard_{}", card_name.replace(" ", "_").replace("/", "_"));
    
    // Create BDO user for this card
    let card_data = json!({
        "cardName": card_name,
        "cardType": card_type,
        "bdoPubKey": card_bdo_pub_key,
        "svgContent": svg_content,
        "pub": true,
        "createdAt": Utc::now().to_rfc3339(),
        "menuName": menu_name
    });
    
    // Log the card data being stored
    println!("📋 Storing card in BDO:");
    println!("📋 Card Name: {}", card_name);
    println!("📋 Card PubKey: {}", card_bdo_pub_key);
    println!("📋 Context: {}", card_context);
    println!("📋 SVG Content Length: {} chars", svg_content.len());
    println!("📋 Card Data: {}", serde_json::to_string_pretty(&card_data).unwrap_or_else(|_| "Could not serialize card_data".to_string()));

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
    
    // Now make the BDO user public so cards can be accessed by other users
    println!("🔄 Making BDO user public with UUID: {} and context: {}", bdo_user.uuid, card_context);
    
    // Use update_bdo to make the user public
    println!("🔍 DEBUG: About to call update_bdo with:");
    println!("🔍   UUID: {}", bdo_user.uuid);
    println!("🔍   Hash: {}", card_context);
    println!("🔍   Data keys: {:?}", card_data.as_object().map(|o| o.keys().collect::<Vec<_>>()));
    
    match bdo.update_bdo(&bdo_user.uuid, &card_context, &card_data, &true).await {
        Ok(updated_user) => {
            println!("✅ Made BDO user public for card: {}", card_name);
            println!("🌐 Card is now publicly accessible with pubKey: {}", card_bdo_pub_key);
            println!("🔍 Updated user UUID: {}", updated_user.uuid);
        },
        Err(e) => {
            println!("⚠️ Failed to make BDO user public for card {}: {:?}", card_name, e);
            
            // Let's try to understand what the server is returning
            if let Some(reqwest_err) = e.downcast_ref::<reqwest::Error>() {
                println!("🔍 Reqwest error details: {:?}", reqwest_err);
                if reqwest_err.is_decode() {
                    println!("🔍 This is a JSON decode error - server response format doesn't match BDOUser");
                }
            }
            
            println!("🔍 Continuing with non-public card for debugging");
            // Continue anyway - the card is still created, just not public
        }
    }
    
    // Return the BDO user UUID as the storage result
    Ok(format!("bdo_user:{}", bdo_user.uuid))
}

/// Load the private key for a specific card from the saved keys file
async fn load_card_private_key(menu_name: &str, card_bdo_pub_key: &str) -> Result<String, String> {
    let safe_menu_name = menu_name.replace(|c: char| !c.is_alphanumeric() && c != '_' && c != '-', "_");
    let file_name = format!("{}Keys.json", safe_menu_name);
    
    // Get keys file path
    let app_dir = match std::env::var("HOME") {
        Ok(home) => Path::new(&home).join(".ninefy").join("menu-keys"),
        Err(_) => Path::new(".").join("ninefy_data").join("menu-keys"),
    };
    
    let file_path = app_dir.join(&file_name);
    
    if !file_path.exists() {
        return Err(format!("Keys file not found: {:?}", file_path));
    }
    
    // Read the keys file
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read keys file: {}", e))?;
    
    let keys_json: Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse keys JSON: {}", e))?;
    
    // Find the private key for this public key
    if let Some(keys_obj) = keys_json.get("keys").and_then(|k| k.as_object()) {
        for (_card_id, card_data) in keys_obj {
            if let Some(pub_key) = card_data.get("public_key").and_then(|pk| pk.as_str()) {
                if pub_key == card_bdo_pub_key {
                    if let Some(private_key) = card_data.get("private_key").and_then(|pk| pk.as_str()) {
                        return Ok(private_key.to_string());
                    }
                }
            }
        }
    }
    
    Err(format!("Private key not found for public key: {}", &card_bdo_pub_key[..12]))
}

/// Store the menu structure in BDO with its own unique user
#[tauri::command]
async fn store_menu_in_bdo(menu_name: &str, menu_data: &str) -> Result<String, String> {
    println!("🗄️ Creating unique BDO user for menu: {}", menu_name);
    
    // Generate a unique private key for this menu
    let menu_private_key = generate_unique_private_key();
    
    let bdo_url = get_service_url("bdo");
    let env = env::var("NINEFY_ENV").unwrap_or_else(|_| "dev".to_string());
    
    println!("🔗 Using BDO URL: {} (env: {}) for menu storage", bdo_url, env);
    
    // Create a sessionless instance using the menu's unique private key
    let sessionless = match PrivateKey::from_hex(&menu_private_key) {
        Ok(private_key) => Sessionless::from_private_key(private_key),
        Err(e) => {
            println!("❌ Failed to create private key from hex for menu: {}", e);
            return Err(format!("Invalid private key: {}", e));
        }
    };
    
    // Get the public key for this menu
    let menu_pub_key = sessionless.public_key().to_hex();
    println!("🔑 Generated unique menu pubKey: {}...", &menu_pub_key[..12]);
    
    let bdo = BDO::new(Some(bdo_url), Some(sessionless));
    
    // Create a unique context for this menu
    let menu_context = format!("magicard_menu_{}", menu_name.replace(" ", "_").replace("/", "_"));
    
    // Parse the menu data to store it properly
    let menu_json: serde_json::Value = match serde_json::from_str(menu_data) {
        Ok(json) => json,
        Err(e) => {
            println!("❌ Failed to parse menu data as JSON: {}", e);
            return Err(format!("Invalid menu JSON: {}", e));
        }
    };
    
    // Log the menu data being stored for debugging
    println!("📋 Menu data being stored in BDO:");
    println!("📋 Context: {}", menu_context);
    println!("📋 Menu JSON: {}", serde_json::to_string_pretty(&menu_json).unwrap_or_else(|_| "Could not serialize menu_json".to_string()));
    
    // Create BDO user for this menu
    match bdo.create_user(&menu_context, &menu_json, &true).await {
        Ok(bdo_user) => {
            println!("✅ Created unique BDO user for menu '{}' with UUID: {}", menu_name, bdo_user.uuid);
            println!("🔑 Menu can be imported in MagiCard using pubKey: {}", menu_pub_key);
            
            // Return the menu's unique public key for MagiCard integration
            Ok(menu_pub_key)
        },
        Err(e) => {
            println!("❌ Failed to create BDO user for menu '{}': {:?}", menu_name, e);
            Err(format!("Failed to create BDO user for menu: {}", e))
        }
    }
}

/// Preview what's stored in BDO for a given pubKey (debugging function)
#[tauri::command]
async fn preview_bdo_menu(pub_key: &str) -> Result<String, String> {
    println!("🔍 Previewing BDO data for pubKey: {}...", &pub_key[..12]);
    
    let bdo_url = get_service_url("bdo");
    println!("🔗 Using BDO URL: {}", bdo_url);
    
    // Use our main sessionless instance to access BDO
    let sessionless = get_sessionless().await?;
    let bdo = BDO::new(Some(bdo_url), Some(sessionless));
    
    // Create or get our BDO user for making the request
    let context = "magicard_preview";
    let bdo_user = match bdo.create_user(&context, &json!({}), &false).await {
        Ok(user) => {
            println!("✅ Created/accessed BDO user for preview: {}", user.uuid);
            user
        },
        Err(e) => {
            println!("❌ Failed to create BDO user for preview: {:?}", e);
            return Err("Failed to create BDO user for preview".to_string());
        }
    };
    
    // Use BDO client to fetch the target data
    let our_uuid = bdo_user.uuid.clone();
    let hash = context;
    
    match bdo.get_public_bdo(&our_uuid, hash, pub_key).await {
        Ok(target_bdo_user) => {
            println!("✅ Successfully retrieved BDO data for preview");
            println!("📋 Target BDO User UUID: {}", target_bdo_user.uuid);
            println!("📋 Target BDO User Data: {}", serde_json::to_string_pretty(&target_bdo_user.bdo).unwrap_or_else(|_| "Could not serialize bdo data".to_string()));
            
            // Return formatted preview data
            Ok(format!("BDO Preview for pubKey {}...\nUUID: {}\nData: {}", 
                &pub_key[..12], 
                target_bdo_user.uuid,
                serde_json::to_string_pretty(&target_bdo_user.bdo).unwrap_or_else(|_| "Could not serialize data".to_string())
            ))
        },
        Err(e) => {
            println!("❌ Failed to retrieve BDO data: {:?}", e);
            Err(format!("Failed to retrieve BDO data: {}", e))
        }
    }
}

/// Generate a unique private key for a card
fn generate_unique_private_key() -> String {
    use std::time::UNIX_EPOCH;
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    // Create a unique seed based on current time and process ID
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    
    // Use current thread ID for additional uniqueness
    let thread_id = std::thread::current().id();
    
    // Simple unique key generation (in production, use proper crypto)
    let unique_seed = format!("{}{:?}", timestamp, thread_id);
    
    // Hash the seed to create a 32-byte private key
    let mut hasher = DefaultHasher::new();
    unique_seed.hash(&mut hasher);
    let hash = hasher.finish();
    
    // Convert to hex string (simplified - in production use proper key generation)
    format!("{:064x}", hash)
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
            create_fount_user,
            create_bdo_user,
            get_bases,
            create_dolores_user,
            get_feed,
            get_payment_intent_with_splits,
            get_payment_intent_without_splits,
            create_sanora_user,
            get_orders_for_product_id,
            add_order,
            add_product,
            get_sanora_user,
            toggle_product_availability,
            get_base_products,
            get_all_base_products,
            get_artifact,
            upload_image,
            upload_artifact,
            teleport_content,
            generate_menu_card_keys,
            store_card_in_bdo,
            store_menu_in_bdo,
            preview_bdo_menu
        ])
        .setup(|_app| {
            println!("🛒 Ninefy backend is starting up...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
