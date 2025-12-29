use serde::{Deserialize, Serialize};
use std::io::Write;
use std::net::TcpStream;
use log::info;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrinterConfig {
    pub id: String,
    pub name: String,
    pub printer_type: String, // "network", "usb", "bluetooth"
    pub ip_address: Option<String>,
    pub port: Option<u16>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiptData {
    pub ticket_number: String,
    pub location_name: String,
    pub order_mode: String,
    pub items: Vec<ReceiptItem>,
    pub subtotal: f64,
    pub charges: Vec<ReceiptCharge>,
    pub total: f64,
    pub payment_method: String,
    pub tendered: f64,
    pub change: f64,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiptItem {
    pub name: String,
    pub quantity: i32,
    pub price: f64,
    pub total: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiptCharge {
    pub name: String,
    pub amount: f64,
}

// ESC/POS Commands
pub struct EscPos;

impl EscPos {
    // Initialize printer
    pub const INIT: &'static [u8] = b"\x1B\x40";

    // Text formatting
    pub const BOLD_ON: &'static [u8] = b"\x1B\x45\x01";
    pub const BOLD_OFF: &'static [u8] = b"\x1B\x45\x00";
    pub const DOUBLE_HEIGHT_ON: &'static [u8] = b"\x1D\x21\x11";
    // pub const DOUBLE_WIDTH_ON: &'static [u8] = b"\x1D\x21\x20";
    pub const DOUBLE_SIZE_ON: &'static [u8] = b"\x1D\x21\x33";
    pub const NORMAL_SIZE: &'static [u8] = b"\x1D\x21\x00";

    // Alignment
    pub const ALIGN_LEFT: &'static [u8] = b"\x1B\x61\x00";
    pub const ALIGN_CENTER: &'static [u8] = b"\x1B\x61\x01";
    // pub const ALIGN_RIGHT: &'static [u8] = b"\x1B\x61\x02";

    // Line feed
    pub const LINE_FEED: &'static [u8] = b"\x0A";

    // Cut paper
    pub const CUT_PAPER: &'static [u8] = b"\x1D\x56\x00";
    // pub const PARTIAL_CUT: &'static [u8] = b"\x1D\x56\x01";

    // Open cash drawer
    // pub const OPEN_DRAWER: &'static [u8] = b"\x1B\x70\x00\x19\xFA";
}

pub struct PrinterService;

impl PrinterService {
    pub fn print_receipt(config: &PrinterConfig, receipt: &ReceiptData) -> Result<(), String> {
        match config.printer_type.as_str() {
            "network" => Self::print_network(config, receipt),
            "usb" => Err("USB printing not yet implemented".to_string()),
            "bluetooth" => Err("Bluetooth printing not yet implemented".to_string()),
            _ => Err(format!("Unknown printer type: {}", config.printer_type)),
        }
    }

    fn print_network(config: &PrinterConfig, receipt: &ReceiptData) -> Result<(), String> {
        let ip = config.ip_address.as_ref()
            .ok_or("IP address not configured")?;
        let port = config.port.unwrap_or(9100);

        let address = format!("{}:{}", ip, port);
        info!("🖨️ Connecting to printer at {}", address);

        let mut stream = TcpStream::connect(&address)
            .map_err(|e| format!("Failed to connect to printer: {}", e))?;

        // Build ESC/POS commands
        let commands = Self::build_receipt_commands(receipt);

        stream.write_all(&commands)
            .map_err(|e| format!("Failed to send print data: {}", e))?;

        info!("✅ Receipt sent to printer successfully");
        Ok(())
    }

    fn build_receipt_commands(receipt: &ReceiptData) -> Vec<u8> {
        let mut commands = Vec::new();

        // Initialize
        commands.extend_from_slice(EscPos::INIT);

        // Header - Location Name (centered, double size)
        commands.extend_from_slice(EscPos::ALIGN_CENTER);
        commands.extend_from_slice(EscPos::DOUBLE_SIZE_ON);
        commands.extend_from_slice(receipt.location_name.as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::NORMAL_SIZE);
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Ticket Number (centered, bold)
        commands.extend_from_slice(EscPos::BOLD_ON);
        commands.extend_from_slice(format!("Ticket: {}", receipt.ticket_number).as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::BOLD_OFF);

        // Order Mode
        commands.extend_from_slice(format!("Mode: {}", receipt.order_mode).as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Timestamp
        commands.extend_from_slice(receipt.timestamp.as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Separator line
        commands.extend_from_slice(EscPos::ALIGN_LEFT);
        commands.extend_from_slice(b"--------------------------------");
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Items
        for item in &receipt.items {
            let line = format!(
                "{} x{} @ ${:.2}  ${:.2}",
                item.name,
                item.quantity,
                item.price,
                item.total
            );
            commands.extend_from_slice(line.as_bytes());
            commands.extend_from_slice(EscPos::LINE_FEED);
        }

        commands.extend_from_slice(b"--------------------------------");
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Subtotal
        commands.extend_from_slice(format!("Subtotal:              ${:.2}", receipt.subtotal).as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Charges (tax, fees, etc.)
        for charge in &receipt.charges {
            commands.extend_from_slice(
                format!("{}:              ${:.2}", charge.name, charge.amount).as_bytes()
            );
            commands.extend_from_slice(EscPos::LINE_FEED);
        }

        commands.extend_from_slice(b"--------------------------------");
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Total (bold, larger)
        commands.extend_from_slice(EscPos::BOLD_ON);
        commands.extend_from_slice(EscPos::DOUBLE_HEIGHT_ON);
        commands.extend_from_slice(format!("TOTAL:              ${:.2}", receipt.total).as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::NORMAL_SIZE);
        commands.extend_from_slice(EscPos::BOLD_OFF);

        commands.extend_from_slice(b"--------------------------------");
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Payment info
        commands.extend_from_slice(format!("Payment: {}", receipt.payment_method).as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(format!("Tendered:              ${:.2}", receipt.tendered).as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(format!("Change:                ${:.2}", receipt.change).as_bytes());
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Thank you message (centered)
        commands.extend_from_slice(EscPos::ALIGN_CENTER);
        commands.extend_from_slice(b"Thank You!");
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(b"Please Come Again");
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::LINE_FEED);

        // Cut paper
        commands.extend_from_slice(EscPos::CUT_PAPER);

        commands
    }

    pub fn test_print(config: &PrinterConfig) -> Result<(), String> {
        if config.printer_type != "network" {
            return Err("Only network printers supported for test print".to_string());
        }

        let ip = config.ip_address.as_ref()
            .ok_or("IP address not configured")?;
        let port = config.port.unwrap_or(9100);

        let address = format!("{}:{}", ip, port);
        info!("🖨️ Test print to {}", address);

        let mut stream = TcpStream::connect(&address)
            .map_err(|e| format!("Failed to connect to printer: {}", e))?;

        let mut commands = Vec::new();
        commands.extend_from_slice(EscPos::INIT);
        commands.extend_from_slice(EscPos::ALIGN_CENTER);
        commands.extend_from_slice(EscPos::DOUBLE_SIZE_ON);
        commands.extend_from_slice(b"TEST PRINT");
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::NORMAL_SIZE);
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(b"Printer is working!");
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::LINE_FEED);
        commands.extend_from_slice(EscPos::CUT_PAPER);

        stream.write_all(&commands)
            .map_err(|e| format!("Failed to send test print: {}", e))?;

        info!("✅ Test print sent successfully");
        Ok(())
    }
}
