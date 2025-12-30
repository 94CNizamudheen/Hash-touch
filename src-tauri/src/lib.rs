mod db;
mod commands;
mod websocket;

use std::sync::Arc;

use tokio::sync::mpsc;
use tauri::Manager;

use websocket::WebSocketServer;
use websocket::event_bus::EventBus;

/// ==============================
/// Shared App State
/// ==============================
#[derive(Clone)]
pub struct WsState {
    pub server: Arc<WebSocketServer>,
}

#[derive(Clone)]
pub struct EventBusState {
    pub bus: EventBus,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            log::info!("⚙️  Starting setup...");

            // Logger (debug only)
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Init DB
            db::init(app.handle());

            // ==============================
            // WebSocket + EventBus
            // ==============================

            let (event_tx, event_rx) = mpsc::unbounded_channel();

            let event_bus = EventBus::new(event_rx);
            let event_bus_clone = event_bus.clone();

            let ws_server = Arc::new(WebSocketServer::new(event_tx));

            // Store in Tauri state
            app.manage(WsState {
                server: ws_server.clone(),
            });

            app.manage(EventBusState {
                bus: event_bus.clone(),
            });

            // Start EventBus
            tauri::async_runtime::spawn(async move {
                event_bus_clone.start().await;
            });

            let ws_addr = "0.0.0.0:9001";

            log::info!("🔧 Starting WebSocket server on {}", ws_addr);

            // Start WebSocket server
            tauri::async_runtime::spawn(async move {
                log::info!("🚀 WebSocket server task started, binding to {}", ws_addr);
                match ws_server.start(ws_addr).await {
                    Ok(_) => log::info!("✅ WebSocket server stopped gracefully"),
                    Err(e) => log::error!("❌ WebSocket server error: {}", e),
                }
            });

            log::info!("🚀 Setup complete, app is ready");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Location
            commands::location::get_locations,
            commands::location::save_locations,
            commands::location::select_location,

            // App state
            commands::app_state::get_app_state,
            commands::app_state::clear_app_state,
            commands::app_state::set_tenant,
            commands::app_state::set_location,
            commands::app_state::set_order_modes,
            commands::app_state::set_device_role,
            commands::app_state::set_theme,
            commands::app_state::set_language,
            commands::app_state::get_kds_settings,
            commands::app_state::set_kds_settings,
            commands::app_state::get_kds_view_mode,
            commands::app_state::set_kds_view_mode,
            // commands::app_state::clear_device_data,

            // Device
            commands::device::get_devices,
            commands::device::save_device,
            commands::device::get_device,

            // Products
            commands::product::get_products,
            commands::product::save_products,
            commands::product::clear_products_cache,

            // Product groups
            commands::product_group::get_product_groups,
            commands::product_group::save_product_groups,

            commands::product_group_category::get_product_group_categories,
            commands::product_group_category::save_product_group_categories,

            // Tags
            commands::product_tag_group::get_product_tag_groups,
            commands::product_tag_group::save_product_tag_groups,
            commands::product_tag_group::get_product_tag_groups_by_product,

            commands::product_tag::get_product_tags,
            commands::product_tag::save_product_tags,
            commands::product_tag::get_product_tags_by_group,

            // Combos
            commands::prouct_combo::get_product_with_combos,

            // Categories
            commands::category::get_categories,
            commands::category::save_categories,

            // Cart
            commands::cart_store::get_cart_draft,
            commands::cart_store::save_cart_draft,
            commands::cart_store::clear_cart_draft,

            // Work shift
            commands::work_shift::get_work_shift_draft,
            commands::work_shift::save_work_shift_draft,
            commands::work_shift::clear_work_shift_draft,

            // Charges
            commands::charges::save_charges,
            commands::charges::save_charge_mappings,
            commands::charges::get_charges,
            commands::charges::get_charge_mappings,
            commands::charges::clear_charges_cache,

            // Payment Methods
            commands::payment_method::save_payment_methods,
            commands::payment_method::get_payment_methods,
            commands::payment_method::clear_payment_methods_cache,

            // Tickets
            commands::ticket::save_ticket,
            commands::ticket::get_all_tickets,
            commands::ticket::get_pending_tickets,
            commands::ticket::update_ticket_sync_status,
            commands::ticket::delete_ticket,
            commands::ticket::get_sync_stats,
            commands::ticket::clear_all_tickets,

            // KDS Tickets
            commands::kds_ticket::save_kds_ticket,
            commands::kds_ticket::get_all_kds_tickets,
            commands::kds_ticket::get_active_kds_tickets,
            commands::kds_ticket::get_kds_tickets_by_status,
            commands::kds_ticket::update_kds_ticket_status,
            commands::kds_ticket::delete_kds_ticket,

            // Printers
            commands::printer::get_printers,
            commands::printer::get_active_printers,
            commands::printer::get_printer,
            commands::printer::save_printer,
            commands::printer::delete_printer,
            commands::printer::set_printer_active,
            commands::printer::test_printer,
            commands::printer::print_receipt,
            commands::printer::print_receipt_to_all_active,

            // WebSocket
            commands::websocket::broadcast_to_kds,
            commands::websocket::broadcast_to_queue,
            commands::websocket::broadcast_order,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
