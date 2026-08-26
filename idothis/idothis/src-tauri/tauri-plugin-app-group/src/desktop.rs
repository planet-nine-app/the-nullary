use tauri::{plugin::PluginApi, AppHandle, Runtime};

// Desktop (and, if either app ever ships one, Android) stub — App Groups
// have no equivalent outside iOS, so this just resolves to "nothing shared
// yet" rather than failing to compile or erroring at runtime.
pub struct AppGroup<R: Runtime>(AppHandle<R>);

impl<R: Runtime> AppGroup<R> {
    pub fn write_value(&self, _key: String, _value: String) -> Result<(), String> {
        Ok(())
    }

    pub fn read_value(&self, _key: String) -> Result<Option<String>, String> {
        Ok(None)
    }
}

pub fn init<R: Runtime, C: serde::de::DeserializeOwned>(
    app: &AppHandle<R>,
    _api: PluginApi<R, C>,
) -> tauri::Result<AppGroup<R>> {
    Ok(AppGroup(app.clone()))
}
