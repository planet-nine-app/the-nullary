const COMMANDS: &[&str] = &["write_value", "read_value"];

fn main() {
    // iOS only: App Groups are an iOS-only OS concept, unlike share-sheet
    // this plugin has no Android implementation to point at.
    tauri_plugin::Builder::new(COMMANDS)
        .ios_path("ios")
        .build();
}
