
use serde::{Deserialize, Serialize};

#[derive(Debug,Serialize,Deserialize)]
pub struct DeviceProfile{
    pub id: String,
    pub name: String,
    pub role: String,
    pub config: Option<String>,
    pub sync_status: Option<String>,
}



