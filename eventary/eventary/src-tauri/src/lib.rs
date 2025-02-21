use reqwest::Client;
use sanora_rs::structs::{ProductMeta, SanoraUser, SuccessResult};
use sanora_rs::{Sanora};
use serde_json::json;
use serde_json::Value;
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

async fn get_sessionless() -> Result<Sessionless, String> {
    let private_key = env::var("PRIVATE_KEY").unwrap_or_else(|_| {
        String::from("b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496")
    });
    let sessionless =
        Sessionless::from_private_key(PrivateKey::from_hex(private_key).expect("private key"));
    Ok(sessionless)
}

#[tauri::command]
async fn create_sanora_user() -> Result<SanoraUser, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(
                Some("https://poppy.sanora.allyabase.com/".to_string()),
                Some(sessionless),
            );
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

#[tauri::command]
async fn add_product(
    uuid: &str,
    title: &str,
    description: &str,
    price: u32,
    times: &str,
    location: &str,
) -> Result<ProductMeta, String> {
    let s = get_sessionless().await;
    match s {
        Ok(sessionless) => {
            let sanora = Sanora::new(
                Some("https://poppy.sanora.allyabase.com/".to_string()),
                Some(sessionless),
            );
            let meta = sanora
                //.add_product(uuid, title, description, price, times, location)
                .add_product(uuid, title, description, &price)
                .await;

            dbg!(&meta);
            return match meta {
                Ok(meta) => Ok(meta),
                Err(_) => Err("adding product failed".to_string()),
            };
        }
        Err(_) => Err("no sessionless".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_sanora_user, add_product])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
