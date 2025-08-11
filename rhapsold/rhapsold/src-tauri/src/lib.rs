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
use serde_json::Value;
use sessionless::hex::FromHex;
use sessionless::{PrivateKey, Sessionless};
use std::env;

/// Debug logging command for development
#[tauri::command]
fn dbg(log: &str) {
    dbg!(log);
}

/// Get environment configuration from RHAPSOLD_ENV variable
#[tauri::command]
fn get_env_config() -> String {
    env::var("RHAPSOLD_ENV").unwrap_or_else(|_| "dev".to_string())
}

/// Get service URL based on environment and service name
fn get_service_url(service: &str) -> String {
    let env = env::var("RHAPSOLD_ENV").unwrap_or_else(|_| "dev".to_string());
    
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
        
        // Local environment (127.0.0.1:2999-7277)
        ("local", "julia") => "http://127.0.0.1:3000/".to_string(),
        ("local", "continuebee") => "http://127.0.0.1:2999/".to_string(),
        ("local", "pref") => "http://127.0.0.1:3002/".to_string(),
        ("local", "bdo") => "http://127.0.0.1:3003/".to_string(),
        ("local", "joan") => "http://127.0.0.1:3004/".to_string(),
        ("local", "addie") => "http://127.0.0.1:3005/".to_string(),
        ("local", "fount") => "http://127.0.0.1:3006/".to_string(),
        ("local", "dolores") => "http://127.0.0.1:3007/".to_string(),
        ("local", "aretha") => "http://127.0.0.1:7277/".to_string(),
        ("local", "minnie") => "http://127.0.0.1:2525/".to_string(),
        ("local", "sanora") => "http://127.0.0.1:7243/".to_string(),
        ("local", "covenant") => "http://127.0.0.1:3011/".to_string(),
        
        // Dev environment (default)
        (_, service) => format!("https://dev.{}.allyabase.com/", service),
    }
}

/// Get current environment info for debugging
#[tauri::command]
fn get_environment_info() -> String {
    let mut info = Vec::new();
    
    // Check for RHAPSOLD_ENV
    match env::var("RHAPSOLD_ENV") {
        Ok(env_val) => {
            info.push(format!("RHAPSOLD_ENV = {}", env_val));
        }
        Err(_) => {
            info.push("RHAPSOLD_ENV = (not set)".to_string());
        }
    }
    
    // Check for other common env vars
    let env_vars = ["NULLARY_ENV", "ENV", "NODE_ENV", "RUST_ENV"];
    for var in &env_vars {
        match env::var(var) {
            Ok(val) => info.push(format!("{} = {}", var, val)),
            Err(_) => info.push(format!("{} = (not set)", var))
        }
    }
    
    let result = info.join(", ");
    println!("🌍 Environment Info: {}", result);
    result
}

/// Get or create sessionless instance using environment variable or default key
async fn get_sessionless() -> Result<Sessionless, String> {
    let private_key = env::var("PRIVATE_KEY").unwrap_or_else(|_| {
        println!("🔑 Using default development private key");
        String::from("b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496")
    });
    
    println!("🔐 Initializing sessionless with key: {}...", &private_key[..8]);
    let sessionless =
        Sessionless::from_private_key(PrivateKey::from_hex(private_key).expect("private key"));
    println!("✅ Sessionless initialized successfully");
    Ok(sessionless)
}

/// Create a new Fount user for MAGIC transactions
#[tauri::command]
async fn create_fount_user() -> Result<FountUser, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let fount = Fount::new(
                Some("https://dev.fount.allyabase.com/".to_string()),
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
    let rhapsold = "rhapsold";
    
    // Get BDO URL based on environment
    let bdo_url = get_service_url("bdo");
    let env = env::var("RHAPSOLD_ENV").unwrap_or_else(|_| "dev".to_string());
    
    println!("🔗 Creating BDO user on: {} (env: {})", bdo_url, env);
    
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(
                Some(bdo_url),
                Some(sessionless),
            );
            let _user = bdo.create_user(&rhapsold, &json!({})).await;
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
    let rhapsold = "rhapsold";
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(Some(bdo_url.to_string()), Some(sessionless));
            let bases_result = bdo.get_bases(&uuid, &rhapsold).await;

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
                Some("https://livetest.addie.allyabase.com/".to_string()),
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
                Some("https://livetest.addie.allyabase.com/".to_string()),
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
    println!("🏗️  Creating Sanora user at URL: {}", sanora_url);
    
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            println!("🔗 Connecting to Sanora at: {}", sanora_url);
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            
            println!("📡 Making create_user API call to Sanora...");
            let _user = sanora.create_user().await;
            
            match &_user {
                Ok(user) => {
                    println!("✅ Sanora user created successfully!");
                    println!("   UUID: {}", user.uuid);
                    println!("   Public Key: {}", user.pub_key);
                },
                Err(e) => {
                    println!("❌ Failed to create Sanora user: {:?}", e);
                }
            }
            
            return match _user {
                Ok(user) => Ok(user),
                Err(e) => {
                    let error_msg = format!("Failed to create Sanora user: {:?}", e);
                    println!("🚨 {}", error_msg);
                    Err(error_msg)
                },
            };
        }
        Err(e) => {
            let error_msg = format!("Failed to get sessionless: {}", e);
            println!("🚨 {}", error_msg);
            Err(error_msg)
        },
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
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            let product_result = sanora.add_product(&uuid, &title, &description, &price).await;

            match product_result {
                Ok(meta) => Ok(meta),
                Err(e) => {
                    dbg!(e);
                    Err("failed to add product".to_string())
                }
            }
        }
        Err(_) => Err("no sanora".to_string()),
    }
}

/// Get Sanora user information (which includes their products)
#[tauri::command]
async fn get_sanora_user(uuid: &str, sanora_url: &str) -> Result<SanoraUser, String> {
    println!("📚 Getting Sanora user data:");
    println!("   UUID: {}", uuid);
    println!("   Sanora URL: {}", sanora_url);
    
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            println!("🔗 Connecting to Sanora service...");
            let sanora = Sanora::new(Some(sanora_url.to_string()), Some(sessionless));
            
            println!("📡 Making get_user_by_uuid API call...");
            let user_result = sanora.get_user_by_uuid(&uuid).await;

            match user_result {
                Ok(user) => {
                    println!("✅ Successfully retrieved Sanora user!");
                    println!("   UUID: {}", user.uuid);
                    println!("   Public Key: {}", user.pub_key);
                    println!("   Base Public Key: {}", user.base_pub_key);
                    Ok(user)
                },
                Err(e) => {
                    println!("❌ Failed to get Sanora user: {:?}", e);
                    let error_msg = format!("Failed to get Sanora user: {:?}", e);
                    Err(error_msg)
                }
            }
        }
        Err(e) => {
            let error_msg = format!("Failed to get sessionless: {}", e);
            println!("🚨 {}", error_msg);
            Err(error_msg)
        },
    }
}

/// Get all products/blogs available on the entire base (new /products/base endpoint)
#[tauri::command]
async fn get_all_base_products(sanora_url: &str) -> Result<Value, String> {
    println!("🔄 Getting ALL base products/blogs from: {}", sanora_url);
    
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
                                println!("✅ Got products/blogs JSON from base endpoint");
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
            let rhapsold = "rhapsold";
            let bdo_user = match bdo.create_user(&rhapsold, &json!({})).await {
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
            match bdo.teleport(&bdo_user.uuid, &rhapsold, teleport_url).await {
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
            get_env_config,
            get_environment_info,
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
            get_all_base_products,
            teleport_content
        ])
        .setup(|_app| {
            println!("🎭 Rhapsold backend is starting up...");
            
            // Log environment variables at startup
            match env::var("RHAPSOLD_ENV") {
                Ok(env_val) => {
                    println!("🌍 RHAPSOLD_ENV detected: {}", env_val);
                }
                Err(_) => {
                    println!("🌍 RHAPSOLD_ENV not set, using default");
                }
            }
            
            // Show other relevant env vars
            let env_vars = ["NULLARY_ENV", "PRIVATE_KEY"];
            for var in &env_vars {
                match env::var(var) {
                    Ok(val) => {
                        if var == &"PRIVATE_KEY" {
                            println!("🔑 {} = {}... (truncated)", var, &val[..8]);
                        } else {
                            println!("🌍 {} = {}", var, val);
                        }
                    }
                    Err(_) => {
                        println!("🌍 {} = (not set)", var);
                    }
                }
            }
            
            println!("✅ Rhapsold backend startup complete!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}