use serde::{Deserialize, Serialize};
use tauri::Error;

#[derive(Debug, Deserialize)]
pub struct GiftCardConfig {
    pub client_id: String,
    pub location_id: String,
    pub client_secret: String,
}

/*
RBS POS TOKEN API RESPONSE SHAPE (CONFIRMED):

{
  "Success": true,
  "Message": null,
  "StatusCode": 200,
  "Operation": "GET_POS_OAUTH_TOKEN",
  "Data": {
    "AccessToken": "eyJhbGciOi...",
    "ExpiresIn": 3600
  }
}
*/

#[derive(Debug, Deserialize)]
struct TokenApiResponse {
    #[serde(rename = "Success")]
    success: bool,

    #[serde(rename = "Message")]
    message: Option<String>,

    #[serde(rename = "Data")]
    data: Option<TokenData>,
}

#[derive(Debug, Deserialize)]
struct TokenData {
    #[serde(rename = "AccessToken")]
    access_token: String,

    #[serde(rename = "ExpiresIn")]
    expires_in: i64,
}

#[derive(Debug, Serialize)]
pub struct GiftCardTokenResult {
    pub access_token: String,
    pub expires_in: i64,
}

#[tauri::command]
pub async fn giftcard_get_token(
    config: GiftCardConfig,
) -> Result<GiftCardTokenResult, Error> {
    let url =
        "https://uatapi.rbsgiftserver.com/api/partner/v1/oauth/token";

    let client = reqwest::Client::new();

    let response = client
        .get(url) // ✅ GET (as confirmed by RBS + C# code)
        .header("x-client-id", &config.client_id)
        .header("x-client-location-id", &config.location_id)
        .header(
            "x-client-location-secret",
            &config.client_secret,
        )
        .send()
        .await
        .map_err(|e| Error::Anyhow(anyhow::anyhow!(e)))?;

    // Optional but safe: handle non-200 HTTP
    if !response.status().is_success() {
        let text = response.text().await.unwrap_or_default();
        return Err(Error::Anyhow(anyhow::anyhow!(
            "Token API HTTP error: {}",
            text
        )));
    }

    // Parse wrapped RBS response
    let body: TokenApiResponse = response
        .json()
        .await
        .map_err(|e| Error::Anyhow(anyhow::anyhow!(e)))?;

    if !body.success {
        return Err(Error::Anyhow(anyhow::anyhow!(
            body.message.unwrap_or("Token API failed".to_string())
        )));
    }

    let data = body.data.ok_or_else(|| {
        Error::Anyhow(anyhow::anyhow!(
            "Token API response missing Data"
        ))
    })?;

    Ok(GiftCardTokenResult {
        access_token: data.access_token,
        expires_in: data.expires_in,
    })
}
