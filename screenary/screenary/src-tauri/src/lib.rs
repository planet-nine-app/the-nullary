use addie_rs::structs::PaymentIntent;
use addie_rs::Addie;
use bdo_rs::structs::BDOUser;
use bdo_rs::{Bases, Spellbook, BDO};
use dolores_rs::structs::Feed;
use dolores_rs::{Dolores, DoloresUser};
use fount_rs::structs::Gateway;
use fount_rs::{Fount, FountUser};
use reqwest::Client;
use serde_json::json;
use serde_json::Value;
use sessionless::hex::FromHex;
use sessionless::hex::IntoHex;
use sessionless::{PrivateKey, Sessionless};
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
fn dbg(log: &str) {
    dbg!(log);
}

async fn get_sessionless() -> Result<Sessionless, String> {
    let private_key = env::var("PRIVATE_KEY").unwrap_or_else(|_| {
        String::from("b75011b167c5e3a6b0de97d8e1950cd9548f83bb67f47112bed6a082db795496")
    });
    let sessionless =
        Sessionless::from_private_key(PrivateKey::from_hex(private_key).expect("private key"));
    Ok(sessionless)
}

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

#[tauri::command]
async fn create_bdo_user() -> Result<BDOUser, String> {
    let s = get_sessionless().await;
    let screenary = "screenary";
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(
                Some("https://dev.bdo.allyabase.com/".to_string()),
                Some(sessionless),
            );
            let _user = bdo.create_user(&screenary, &json!({})).await;
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
async fn get_bases(uuid: &str, bdo_url: &str) -> Result<Value, String> {
    let s = get_sessionless().await;
    let screenary = "screenary";
    match s {
        Ok(sessionless) => {
            let bdo = BDO::new(Some(bdo_url.to_string()), Some(sessionless));
            let bases_result = bdo.get_bases(&uuid, &screenary).await;

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
                Some("https://dev.addie.allyabase.com/".to_string()),
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .setup(move |app| {
            #[cfg(mobile)]
            {
                app.handle().plugin(tauri_plugin_nfc::init())?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            dbg,
            create_fount_user,
            create_bdo_user,
            get_bases,
            create_dolores_user,
            get_feed,
            get_payment_intent_without_splits
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
