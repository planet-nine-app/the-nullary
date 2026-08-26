use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

#[cfg(target_os = "ios")]
mod mobile;
#[cfg(not(target_os = "ios"))]
mod desktop;

#[cfg(target_os = "ios")]
use mobile::AppGroup;
#[cfg(not(target_os = "ios"))]
use desktop::AppGroup;

/// Reads/writes one JSON-string value under `key` in the
/// `group.freyja.idothis` App Group, shared between BizBuz and Linkitylink.
#[tauri::command]
async fn write_value<R: Runtime>(app: tauri::AppHandle<R>, key: String, value: String) -> Result<(), String> {
    app.state::<AppGroup<R>>().write_value(key, value)
}

#[tauri::command]
async fn read_value<R: Runtime>(app: tauri::AppHandle<R>, key: String) -> Result<Option<String>, String> {
    app.state::<AppGroup<R>>().read_value(key)
}

/// Same-process access for an app's own commands, so a mapping command that
/// reads the *other* app's shared key can do so server-side without a JS
/// round-trip through `write_value`/`read_value`.
pub fn write_value_sync<R: Runtime>(app: &tauri::AppHandle<R>, key: &str, value: &str) -> Result<(), String> {
    app.state::<AppGroup<R>>().write_value(key.to_string(), value.to_string())
}
pub fn read_value_sync<R: Runtime>(app: &tauri::AppHandle<R>, key: &str) -> Result<Option<String>, String> {
    app.state::<AppGroup<R>>().read_value(key.to_string())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("app-group")
        .invoke_handler(tauri::generate_handler![write_value, read_value])
        .setup(|app, api| {
            #[cfg(target_os = "ios")]
            let app_group = mobile::init(app, api)?;
            #[cfg(not(target_os = "ios"))]
            let app_group = desktop::init(app, api)?;
            app.manage(app_group);
            Ok(())
        })
        .build()
}
