// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lib;

use lib::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Profile management (prof service)
            create_profile,
            get_profile,
            update_profile,
            delete_profile,
            get_profile_image_url,
            
            // Product management (sanora service)
            create_product,
            get_user_products,
            get_products_by_tags,
            update_product,
            delete_product,
            
            // Magical contract management (covenant service)
            create_contract,
            get_contract,
            sign_contract_step,
            get_my_contracts,
            get_contract_svg,
            
            // Service management
            get_sessionless_info,
            health_check,
            
            // Debug utilities
            dbg
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}