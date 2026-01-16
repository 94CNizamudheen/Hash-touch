use std::io::Write;
use std::net::TcpStream;
use std::time::Duration;
use log::info;

use super::escpos::PrinterConfig;

pub struct PrinterService;

impl PrinterService {
    /// Print a test page to verify printer connectivity
    /// Uses minimal inline ESC/POS commands
    pub fn test_print(config: &PrinterConfig) -> Result<(), String> {
        match config.printer_type.as_str() {
            "network" => {
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

                // Minimal inline test print ESC/POS commands
                let commands: Vec<u8> = vec![
                    0x1B, 0x40,             // Initialize printer
                    0x1B, 0x61, 0x01,       // Center align
                    0x1D, 0x21, 0x33,       // Double size
                    b'T', b'E', b'S', b'T', b' ', b'P', b'R', b'I', b'N', b'T',
                    0x0A,                   // Line feed
                    0x1D, 0x21, 0x00,       // Normal size
                    0x0A,
                    b'P', b'r', b'i', b'n', b't', b'e', b'r', b' ', b'i', b's', b' ', b'w', b'o', b'r', b'k', b'i', b'n', b'g', b'!',
                    0x0A, 0x0A, 0x0A,
                    0x1D, 0x56, 0x00,       // Cut paper
                ];

                stream.write_all(&commands)
                    .map_err(|e| format!("Failed to send test print: {}", e))?;

                stream.flush()
                    .map_err(|e| format!("Failed to flush data: {}", e))?;

                info!("✅ Test print sent successfully");
                Ok(())
            },
            "builtin" => {
                // Built-in printer test is handled via frontend JavaScript bridge
                info!("🖨️ Built-in printer test - handled via frontend bridge");
                Ok(())
            },
            _ => Err(format!("Test print not supported for: {}", config.printer_type)),
        }
    }

    /// Print raw pre-formatted ESC/POS data (formatted by TypeScript)
    /// This is the primary print method - all formatting is done in frontend
    pub fn print_raw(config: &PrinterConfig, data: &[u8]) -> Result<(), String> {
        match config.printer_type.as_str() {
            "network" => {
                let ip = config.ip_address.as_ref()
                    .ok_or("IP address not configured")?;
                let port = config.port.unwrap_or(9100);

                let address = format!("{}:{}", ip, port);
                info!("🖨️ Sending raw print data to {}", address);

                let stream = TcpStream::connect_timeout(
                    &address.parse().map_err(|e| format!("Invalid address: {}", e))?,
                    Duration::from_secs(5)
                ).map_err(|e| format!("Failed to connect to printer: {}", e))?;

                let mut stream = stream;
                stream.set_write_timeout(Some(Duration::from_secs(10)))
                    .map_err(|e| format!("Failed to set timeout: {}", e))?;

                stream.write_all(data)
                    .map_err(|e| format!("Failed to send print data: {}", e))?;

                stream.flush()
                    .map_err(|e| format!("Failed to flush data: {}", e))?;

                info!("✅ Raw print data sent successfully ({} bytes)", data.len());
                Ok(())
            },
            "builtin" => {
                // Built-in printers are handled via JavaScript bridge
                info!("🖨️ Built-in printer - raw print handled via frontend");
                Ok(())
            },
            _ => Err(format!("Raw printing not supported for type: {}", config.printer_type)),
        }
    }
}
