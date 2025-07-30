// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lib;

use lib::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Connection management
            create_connection,
            get_connections,
            accept_connection,
            block_connection,
            
            // P2P connection mechanism
            generate_connection_url,
            process_connection_url,
            
            // Message management
            get_conversation,
            send_message,
            mark_messages_read,
            
            // Utilities
            get_sessionless_info,
            health_check,
            dbg
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}