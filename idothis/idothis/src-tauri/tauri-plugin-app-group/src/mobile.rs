use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Runtime,
};

tauri::ios_plugin_binding!(init_plugin_app_group);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WriteValueArgs {
    key: String,
    value: String,
}

#[derive(Serialize)]
struct ReadValueArgs {
    key: String,
}

#[derive(Deserialize)]
struct ReadValueResponse {
    value: Option<String>,
}

pub struct AppGroup<R: Runtime>(PluginHandle<R>);

unsafe impl<R: Runtime> Send for AppGroup<R> {}
unsafe impl<R: Runtime> Sync for AppGroup<R> {}

impl<R: Runtime> AppGroup<R> {
    pub fn write_value(&self, key: String, value: String) -> Result<(), String> {
        self.0
            .run_mobile_plugin("writeValue", WriteValueArgs { key, value })
            .map_err(|e| e.to_string())
    }

    pub fn read_value(&self, key: String) -> Result<Option<String>, String> {
        let resp: ReadValueResponse = self
            .0
            .run_mobile_plugin("readValue", ReadValueArgs { key })
            .map_err(|e| e.to_string())?;
        Ok(resp.value)
    }
}

pub fn init<R: Runtime, C: serde::de::DeserializeOwned>(
    _app: &AppHandle<R>,
    api: PluginApi<R, C>,
) -> Result<AppGroup<R>, Box<dyn std::error::Error>> {
    let handle = api.register_ios_plugin(init_plugin_app_group)?;
    Ok(AppGroup(handle))
}
