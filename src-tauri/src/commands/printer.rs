use crate::db::migrate;
use crate::db::models::printer::Printer;
use crate::db::models::printer_repo::PrinterRepo;
use crate::printer::{PrinterConfig, PrinterService};
use tauri::{command, AppHandle};

#[command]
pub fn get_printers(app: AppHandle) -> Result<Vec<Printer>, String> {
    let conn = migrate::connection(&app);
    PrinterRepo::get_all(&conn).map_err(|e| format!("Failed to get printers: {}", e))
}

#[command]
pub fn get_active_printers(app: AppHandle) -> Result<Vec<Printer>, String> {
    let conn = migrate::connection(&app);
    PrinterRepo::get_active(&conn).map_err(|e| format!("Failed to get active printers: {}", e))
}

#[command]
pub fn get_printer(app: AppHandle, id: String) -> Result<Option<Printer>, String> {
    let conn = migrate::connection(&app);
    PrinterRepo::get_by_id(&conn, &id).map_err(|e| format!("Failed to get printer: {}", e))
}

#[command]
pub fn save_printer(app: AppHandle, printer: Printer) -> Result<(), String> {
    let conn = migrate::connection(&app);
    PrinterRepo::save(&conn, &printer).map_err(|e| format!("Failed to save printer: {}", e))
}

#[command]
pub fn delete_printer(app: AppHandle, id: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    PrinterRepo::delete(&conn, &id).map_err(|e| format!("Failed to delete printer: {}", e))
}

#[command]
pub fn set_printer_active(app: AppHandle, id: String, is_active: bool) -> Result<(), String> {
    let conn = migrate::connection(&app);
    PrinterRepo::set_active(&conn, &id, is_active)
        .map_err(|e| format!("Failed to update printer status: {}", e))
}

#[command]
pub fn test_printer(printer: Printer) -> Result<(), String> {
    let config = PrinterConfig {
        id: printer.id,
        name: printer.name,
        printer_type: printer.printer_type,
        ip_address: printer.ip_address,
        port: printer.port.map(|p| p as u16),
        is_active: printer.is_active,
    };

    PrinterService::test_print(&config)
}

/// Print raw ESC/POS data to a specific printer
/// The data should be base64 encoded ESC/POS commands from TypeScript
#[command]
pub fn print_raw(app: AppHandle, printer_id: String, data: String) -> Result<(), String> {
    let conn = migrate::connection(&app);

    let printer = PrinterRepo::get_by_id(&conn, &printer_id)
        .map_err(|e| format!("Failed to get printer: {}", e))?
        .ok_or("Printer not found")?;

    if !printer.is_active {
        return Err("Printer is not active".to_string());
    }

    // Skip builtin printers (handled by frontend)
    if printer.printer_type == "builtin" {
        return Ok(());
    }

    let config = PrinterConfig {
        id: printer.id,
        name: printer.name,
        printer_type: printer.printer_type,
        ip_address: printer.ip_address,
        port: printer.port.map(|p| p as u16),
        is_active: printer.is_active,
    };

    // Decode base64 data
    use base64::{Engine as _, engine::general_purpose::STANDARD};
    let raw_bytes = STANDARD.decode(&data)
        .map_err(|e| format!("Failed to decode base64 data: {}", e))?;

    PrinterService::print_raw(&config, &raw_bytes)
}

/// Print raw ESC/POS data to all active network printers
/// The data should be base64 encoded ESC/POS commands from TypeScript
#[command]
pub fn print_raw_to_all_active(app: AppHandle, data: String) -> Result<(), String> {
    let conn = migrate::connection(&app);

    let printers = PrinterRepo::get_active(&conn)
        .map_err(|e| format!("Failed to get active printers: {}", e))?;

    // Filter only network printers (builtin handled by frontend)
    let network_printers: Vec<_> = printers.into_iter()
        .filter(|p| p.printer_type == "network")
        .collect();

    if network_printers.is_empty() {
        // No network printers, that's ok - builtin will be handled by frontend
        return Ok(());
    }

    // Decode base64 data once
    use base64::{Engine as _, engine::general_purpose::STANDARD};
    let raw_bytes = STANDARD.decode(&data)
        .map_err(|e| format!("Failed to decode base64 data: {}", e))?;

    let mut errors = Vec::new();

    for printer in network_printers {
        let config = PrinterConfig {
            id: printer.id.clone(),
            name: printer.name.clone(),
            printer_type: printer.printer_type.clone(),
            ip_address: printer.ip_address.clone(),
            port: printer.port.map(|p| p as u16),
            is_active: printer.is_active,
        };

        if let Err(e) = PrinterService::print_raw(&config, &raw_bytes) {
            errors.push(format!("Printer '{}': {}", printer.name, e));
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(format!("Some printers failed: {}", errors.join("; ")))
    }
}
