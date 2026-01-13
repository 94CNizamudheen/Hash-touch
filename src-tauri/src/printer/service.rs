use std::io::Write;
use std::net::TcpStream;
use std::time::Duration;
use log::info;

use super::escpos::{PrinterConfig, ReceiptData, build_receipt_commands, build_test_print_commands};

pub struct PrinterService;

impl PrinterService {
    /// Print a receipt to the specified printer
    pub fn print_receipt(config: &PrinterConfig, receipt: &ReceiptData) -> Result<(), String> {
        match config.printer_type.as_str() {
            "network" => Self::print_network(config, receipt),
            "usb" => Err("USB printing not yet implemented".to_string()),
            "bluetooth" => Self::print_bluetooth(config, receipt),
            _ => Err(format!("Unknown printer type: {}", config.printer_type)),
        }
    }

    /// Print a test page to verify printer connectivity
    pub fn test_print(config: &PrinterConfig) -> Result<(), String> {
        match config.printer_type.as_str() {
            "network" => Self::test_print_network(config),
            "bluetooth" => Self::test_print_bluetooth(config),
            _ => Err(format!("Test print not supported for: {}", config.printer_type)),
        }
    }

    /// Network printing via TCP socket (works on both desktop and mobile)
    fn print_network(config: &PrinterConfig, receipt: &ReceiptData) -> Result<(), String> {
        let ip = config.ip_address.as_ref()
            .ok_or("IP address not configured")?;
        let port = config.port.unwrap_or(9100);

        let address = format!("{}:{}", ip, port);
        info!("🖨️ Connecting to network printer at {}", address);

        // Connect with timeout
        let stream = TcpStream::connect_timeout(
            &address.parse().map_err(|e| format!("Invalid address: {}", e))?,
            Duration::from_secs(5)
        ).map_err(|e| format!("Failed to connect to printer: {}", e))?;

        let mut stream = stream;
        stream.set_write_timeout(Some(Duration::from_secs(10)))
            .map_err(|e| format!("Failed to set timeout: {}", e))?;

        // Build ESC/POS commands
        let commands = build_receipt_commands(receipt);

        stream.write_all(&commands)
            .map_err(|e| format!("Failed to send print data: {}", e))?;

        stream.flush()
            .map_err(|e| format!("Failed to flush data: {}", e))?;

        info!("✅ Receipt sent to printer successfully");
        Ok(())
    }

    fn test_print_network(config: &PrinterConfig) -> Result<(), String> {
        let ip = config.ip_address.as_ref()
            .ok_or("IP address not configured")?;
        let port = config.port.unwrap_or(9100);

        let address = format!("{}:{}", ip, port);
        info!("🖨️ Test print to network printer at {}", address);

        let stream = TcpStream::connect_timeout(
            &address.parse().map_err(|e| format!("Invalid address: {}", e))?,
            Duration::from_secs(5)
        ).map_err(|e| format!("Failed to connect to printer: {}", e))?;

        let mut stream = stream;
        stream.set_write_timeout(Some(Duration::from_secs(10)))
            .map_err(|e| format!("Failed to set timeout: {}", e))?;

        let commands = build_test_print_commands();

        stream.write_all(&commands)
            .map_err(|e| format!("Failed to send test print: {}", e))?;

        stream.flush()
            .map_err(|e| format!("Failed to flush data: {}", e))?;

        info!("✅ Test print sent successfully");
        Ok(())
    }

    /// Bluetooth printing (placeholder - needs platform-specific implementation)
    /// On Android, this would use Android's BluetoothSocket
    /// For now, we return an error with instructions
    fn print_bluetooth(_config: &PrinterConfig, _receipt: &ReceiptData) -> Result<(), String> {
        // Note: Bluetooth printing on Android requires:
        // 1. Bluetooth permissions in AndroidManifest.xml
        // 2. Native Android code to handle BluetoothSocket
        // 3. A Tauri plugin or JNI bridge

        // For Android POS devices that expose Bluetooth printers as network printers,
        // users should configure them as "network" type with the printer's IP

        Err("Bluetooth printing requires native implementation. \
             If your Bluetooth printer supports network mode, \
             configure it as a network printer instead.".to_string())
    }

    fn test_print_bluetooth(_config: &PrinterConfig) -> Result<(), String> {
        Err("Bluetooth test print requires native implementation.".to_string())
    }

    /// Send raw ESC/POS commands to a network printer
    pub fn send_raw_commands(config: &PrinterConfig, commands: &[u8]) -> Result<(), String> {
        if config.printer_type != "network" {
            return Err("Raw commands only supported for network printers".to_string());
        }

        let ip = config.ip_address.as_ref()
            .ok_or("IP address not configured")?;
        let port = config.port.unwrap_or(9100);

        let address = format!("{}:{}", ip, port);

        let stream = TcpStream::connect_timeout(
            &address.parse().map_err(|e| format!("Invalid address: {}", e))?,
            Duration::from_secs(5)
        ).map_err(|e| format!("Failed to connect: {}", e))?;

        let mut stream = stream;
        stream.write_all(commands)
            .map_err(|e| format!("Failed to send: {}", e))?;

        stream.flush()
            .map_err(|e| format!("Failed to flush: {}", e))?;

        Ok(())
    }
}
