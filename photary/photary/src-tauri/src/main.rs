// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lib;

use lib::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Base management
            get_bases,
            join_base,
            leave_base,
            
            // Feed management
            get_feed,
            refresh_feed,
            
            // User management
            create_bdo_user,
            create_dolores_user,
            
            // Utilities
            get_sessionless_info,
            health_check,
            dbg
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}