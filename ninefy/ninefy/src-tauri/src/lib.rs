use addie_rs::structs::{PaymentIntent, Payee};
use addie_rs::Addie;
use bdo_rs::structs::BDOUser;
use bdo_rs::{Bases, Spellbook, BDO};
use dolores_rs::structs::Feed;
use dolores_rs::{Dolores, DoloresUser};
use fount_rs::structs::Gateway;
use fount_rs::{Fount, FountUser};
use sanora_rs::structs::{Order, SanoraUser, ProductMeta};
use sanora_rs::{Orders, Sanora};
use reqwest::Client;
use serde_json::json;
use serde_json::Value;
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
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
            let _user = bdo.create_user(&ninefy, &json!({})).await;
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

/// Create a new blog product in Sanora
#[tauri::command]
async fn add_product(uuid: &str, sanora_url: &str, title: &str, description: &str, price: u32) -> Result<ProductMeta, String> {
    println!("🦀 Rust add_product called with: uuid={}, sanora_url={}, title={}, price={}", uuid, sanora_url, title, price);
    
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            println!("🦀 Calling sanora.add_product with sessionless authentication");
            let product_result = sanora.add_product(&uuid, &title, &description, &price).await;

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
            let bdo_user = match bdo.create_user(&ninefy, &json!({})).await {
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
            upload_image,
            upload_artifact,
            teleport_content
        ])
        .setup(|_app| {
            println!("🛒 Ninefy backend is starting up...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}