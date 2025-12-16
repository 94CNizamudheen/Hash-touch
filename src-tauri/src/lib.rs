mod db;
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            log::info!("⚙️  Starting setup...");
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            db::init(app.handle());

            log::info!("🚀 Setup complete, app is ready");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::location::get_locations,
            commands::location::save_locations,
            commands::location::select_location,
            commands::device::get_devices,
            commands::device::save_device,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

