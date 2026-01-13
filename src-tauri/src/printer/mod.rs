pub mod escpos;
pub mod service;

pub use escpos::{PrinterConfig, ReceiptData, ReceiptItem, ReceiptCharge};
pub use service::PrinterService;
