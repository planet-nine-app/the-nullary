// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lib;

use lib::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Profile management
            create_profile,
            get_profile,
            update_profile,
            delete_profile,
            get_profile_image_url,
            
            // Base management
            get_bases,
            join_base,
            leave_base,
            get_base_profiles,
            get_base_stats,
            
            // Social feed management
            get_social_feed,
            refresh_social_feed,
            
            // Post creation (all types)
            create_text_post,
            create_photo_post,
            create_video_post,
            
            // Post management
            get_user_posts,
            delete_post,
            
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