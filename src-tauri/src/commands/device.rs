use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::device::DeviceProfile;
use crate::db::models::device_repo;

#[tauri::command]
pub fn get_devices(app: AppHandle) -> Result<Vec<DeviceProfile>, String> {
    let conn = migrate::connection(&app);
    device_repo::get_devices(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_device(app: AppHandle, device: DeviceProfile) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    device_repo::save_device(&mut conn, &device).map_err(|e| e.to_string())
}
