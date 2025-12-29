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
            
            commands::app_state::get_app_state,
            commands::app_state::clear_app_state,
            commands::device::get_devices,
            commands::device::save_device,
            commands::device::get_device,

            commands::product::get_products,
            commands::product::save_products,
            commands::product::clear_products_cache,

            commands::app_state::set_tenant,
            commands::app_state::set_location,
            commands::app_state::set_order_modes,
            commands::app_state::set_device_role,
            commands::app_state::set_theme,
            commands::app_state::set_language,

            commands::product_group::get_product_groups,
            commands::product_group::save_product_groups,

            commands::product_group_category::get_product_group_categories,
            commands::product_group_category::save_product_group_categories,

            commands::product_tag_group::get_product_tag_groups,
            commands::product_tag_group::save_product_tag_groups, 
            commands::product_tag_group::get_product_tag_groups_by_product,

            commands::product_tag::get_product_tags,
            commands::product_tag::save_product_tags,
            commands::product_tag::get_product_tags_by_group,

            commands::prouct_combo::get_product_with_combos,

            commands::category::get_categories,
            commands::category::save_categories,

            commands::cart_store::get_cart_draft,
            commands::cart_store::save_cart_draft,
            commands::cart_store::clear_cart_draft,

            commands::work_shift::get_work_shift_draft,
            commands::work_shift::save_work_shift_draft,
            commands::work_shift::clear_work_shift_draft,

            commands::charges::save_charges,
            commands::charges::save_charge_mappings,
            commands::charges::get_charges,
            commands::charges::get_charge_mappings,
            commands::charges::clear_charges_cache,

            commands::ticket::save_ticket,
            commands::ticket::get_all_tickets,
            commands::ticket::get_pending_tickets,
            commands::ticket::update_ticket_sync_status,
            commands::ticket::delete_ticket,
            commands::ticket::get_sync_stats,
            commands::ticket::clear_all_tickets,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

