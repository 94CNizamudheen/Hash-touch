use std::io::Write;
use std::net::TcpStream;
use std::time::Duration;
// use log::info;

use super::escpos::PrinterConfig;

pub struct PrinterService;

impl PrinterService {

    pub fn test_print(config: &PrinterConfig) -> Result<(), String> {
        match config.printer_type.as_str() {

            "network" => {
                let ip = config.ip_address.as_ref()
                    .ok_or("IP address not configured")?;
                let port = config.port.unwrap_or(9100);
                let address = format!("{}:{}", ip, port);

                let stream = TcpStream::connect_timeout(
                    &address.parse().map_err(|e| format!("Invalid address: {}", e))?,
                    Duration::from_secs(5),
                ).map_err(|e| format!("Failed to connect: {}", e))?;

                let mut stream = stream;
                stream.set_write_timeout(Some(Duration::from_secs(10)))
                    .map_err(|e| format!("Timeout set failed: {}", e))?;

                let commands: Vec<u8> = vec![
                    0x1B, 0x40,
                    0x1B, 0x61, 0x01,
                    0x1D, 0x21, 0x33,
                    b'T', b'E', b'S', b'T',
                    0x0A,
                    0x1D, 0x21, 0x00,
                    0x0A,
                    b'O', b'K',
                    0x0A, 0x0A,
                    0x1D, 0x56, 0x00,
                ];

                stream.write_all(&commands)
                    .map_err(|e| format!("Send failed: {}", e))?;

                stream.flush()
                    .map_err(|e| format!("Flush failed: {}", e))?;

                Ok(())
            }

            "builtin" => {
                Err("Builtin printer must be handled via Android bridge".to_string())
            }

            _ => Err("Unsupported printer type".to_string()),
        }
    }

    pub fn print_raw(config: &PrinterConfig, data: &[u8]) -> Result<(), String> {
        match config.printer_type.as_str() {

            "network" => {
                let ip = config.ip_address.as_ref()
                    .ok_or("IP not configured")?;
                let port = config.port.unwrap_or(9100);

                let address = format!("{}:{}", ip, port);

                let stream = TcpStream::connect_timeout(
                    &address.parse().map_err(|e| format!("Invalid address: {}", e))?,
                    Duration::from_secs(5),
                ).map_err(|e| format!("Connect failed: {}", e))?;

                let mut stream = stream;
                stream.set_write_timeout(Some(Duration::from_secs(10)))
                    .map_err(|e| format!("Timeout set failed: {}", e))?;

                stream.write_all(data)
                    .map_err(|e| format!("Write failed: {}", e))?;

                stream.flush()
                    .map_err(|e| format!("Flush failed: {}", e))?;

                Ok(())
            }

            "builtin" => {
                Err("Builtin printer must be printed via Android bridge".to_string())
            }

            _ => Err("Unsupported printer type".to_string()),
        }
    }
}
