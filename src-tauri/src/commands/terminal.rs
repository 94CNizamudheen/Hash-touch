use serde::{Deserialize, Serialize};
use tauri::Error;

/* -------------------------------------------------------------------------- */
/*                              HTTP CLIENT (DEV)                              */
/* -------------------------------------------------------------------------- */
/*
 ⚠️ DEV / UAT ONLY
 RBSPay dev endpoint has invalid / mismatched SSL cert.
 DO NOT use danger_accept_invalid_certs(true) in PROD.
*/

fn build_http_client() -> Result<reqwest::Client, Error> {
    reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| Error::Anyhow(anyhow::anyhow!(e)))
}

/* -------------------------------------------------------------------------- */
/*                               CONFIG STRUCT                                 */
/* -------------------------------------------------------------------------- */

#[derive(Debug, Deserialize)]
pub struct RbsPayConfig {
    pub api_key: String,
    pub base_url: String,
    pub terminal_id: String,
}

/* -------------------------------------------------------------------------- */
/*                          INITIATE TRANSACTION                               */
/* -------------------------------------------------------------------------- */

#[derive(Debug, Deserialize)]
pub struct TerminalInitiateRequest {
    pub config: RbsPayConfig,
    pub amount: f64,
    pub currency: String, 
    pub payment_method: String,
    pub invoice_number: String,
    pub description: String,
    pub tax_amount: f64,
    pub tip_amount: f64,
    pub triggered_by: String,
}

/* ------------------------ IQPRO RESPONSE STRUCTS --------------------------- */

#[derive(Debug, Deserialize)]
struct RbsTerminalInitiateApiResponse {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<IqProTerminalData>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct IqProTerminalData {
    pub transaction_id: String,
    pub terminal_id: Option<String>,
    pub gateway_transaction_id: Option<String>,
}

/* ----------------------------- INITIATE API -------------------------------- */

#[tauri::command]
pub async fn rbs_terminal_initiate(
    payload: TerminalInitiateRequest,
) -> Result<IqProTerminalData, Error> {
    let url = format!("{}/terminal/transactions", payload.config.base_url);
    let client = build_http_client()?;

    let response = client
        .post(&url)
        .header("x-api-key", &payload.config.api_key)
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({
    "terminal_id": payload.config.terminal_id,
    "amount": payload.amount,
    "currency": "USD",
    "payment_method": payload.payment_method,
    "invoice_number": payload.invoice_number,
    "description": payload.description,
    "tax_amount": payload.tax_amount,
    "tip_amount": payload.tip_amount,
    "triggered_by": payload.triggered_by,
    "metadata": {}
}))
        .send()
        .await
        .map_err(|e| Error::Anyhow(anyhow::anyhow!(e)))?;

    if !response.status().is_success() {
        let text = response.text().await.unwrap_or_default();
        return Err(Error::Anyhow(anyhow::anyhow!(
            "RBSPay initiate HTTP error: {}",
            text
        )));
    }

    let body: RbsTerminalInitiateApiResponse = response
        .json()
        .await
        .map_err(|e| Error::Anyhow(anyhow::anyhow!(e)))?;

    if !body.success {
        return Err(Error::Anyhow(anyhow::anyhow!(
            body.message.unwrap_or("Terminal initiation failed".to_string())
        )));
    }

    body.data.ok_or_else(|| {
        Error::Anyhow(anyhow::anyhow!(
            "Terminal initiation response missing data"
        ))
    })
}

/* -------------------------------------------------------------------------- */
/*                          CANCEL TRANSACTION                                 */
/* -------------------------------------------------------------------------- */

#[tauri::command]
pub async fn rbs_terminal_cancel(
    config: RbsPayConfig,
    transaction_id: String,
) -> Result<(), Error> {
    let url = format!(
        "{}/terminal/transactions/{}",
        config.base_url, transaction_id
    );

    let client = build_http_client()?;

    let response = client
        .delete(&url)
        .header("x-api-key", &config.api_key)
        .send()
        .await
        .map_err(|e| Error::Anyhow(anyhow::anyhow!(e)))?;

    if !response.status().is_success() {
        let text = response.text().await.unwrap_or_default();
        return Err(Error::Anyhow(anyhow::anyhow!(
            "RBSPay cancel failed: {}",
            text
        )));
    }

    Ok(())
}

/* -------------------------------------------------------------------------- */
/*                        GET / POLL TRANSACTION                               */
/* -------------------------------------------------------------------------- */

#[derive(Debug, Serialize)]
pub struct TransactionStatusResponse {
    pub transaction_id: String,
    pub status: String,
    pub response: Option<String>,
    pub processor_response_text: Option<String>,
    pub processor_response_code: Option<String>,
    pub payment_method: Option<String>,
    pub amount: Option<f64>,
    pub currency: Option<String>,
}
#[tauri::command]
pub async fn rbs_get_transaction(
    config: RbsPayConfig,
    transaction_id: String,
) -> Result<TransactionStatusResponse, Error> {
    let client = build_http_client()?;

    let url = format!(
        "{}/gettransaction",
        config.base_url
    );

    let response = client
        .get(&url)
        .header("x-api-key", &config.api_key)
        .query(&[("transaction_id", transaction_id)])
        .send()
        .await
        .map_err(|e| Error::Anyhow(anyhow::anyhow!(e)))?;

    if !response.status().is_success() {
        let text = response.text().await.unwrap_or_default();
        return Err(Error::Anyhow(anyhow::anyhow!(
            "RBSPay get transaction failed: {}",
            text
        )));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| Error::Anyhow(anyhow::anyhow!(e)))?;

    let data = &json["data"];

    Ok(TransactionStatusResponse {
        transaction_id: data["transaction_id"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        status: data["status"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        response: data["response"].as_str().map(String::from),
        processor_response_text: data["processor_response_text"]
            .as_str().map(String::from),
        processor_response_code: data["processor_response_code"]
            .as_str().map(String::from),
        payment_method: data["payment_method"]
            .as_str().map(String::from),
        amount: data["remit"]["amount"].as_f64(),
        currency: data["currency"].as_str().map(String::from),
    })
}
