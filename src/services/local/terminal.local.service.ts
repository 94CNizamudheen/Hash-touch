import { invoke } from "@tauri-apps/api/core";

/* -------------------------------------------------------------------------- */
/*                               CONFIG TYPES                                  */
/* -------------------------------------------------------------------------- */

export interface RbsPayConfig {
  api_key: string;
  base_url: string;
  terminal_id: string;
}

/* -------------------------------------------------------------------------- */
/*                            INITIATE REQUEST                                  */
/* -------------------------------------------------------------------------- */

export interface TerminalInitiatePayload {
  config: RbsPayConfig;
  amount: number;
  currency: string;
  payment_method: string;
  invoice_number: string;
  description: string;
  tax_amount: number;
  tip_amount: number;
  triggered_by: string;
}

/* -------------------------------------------------------------------------- */
/*                            INITIATE RESPONSE                                 */
/* -------------------------------------------------------------------------- */

export interface TerminalTransactionData {
  transaction_id: string;
  terminal_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  invoice_number: string;
  description: string;
  tax_amount: number;
  tip_amount: number;
  gateway_transaction_id: string;
}

/* -------------------------------------------------------------------------- */
/*                         POLLING RESPONSE                                     */
/* -------------------------------------------------------------------------- */

export interface TerminalTransactionStatus {
  transaction_id: string;
  status: string;
  response?: string;
  processor_response_text?: string;
  processor_response_code?: string;
  payment_method?: string;
  amount?: number;
  currency?: string;
}

/* -------------------------------------------------------------------------- */
/*                              TERMINAL SERVICE                                */
/* -------------------------------------------------------------------------- */

export const terminalService = {
  /* ------------------------- Initiate Terminal ------------------------- */
  initiate(payload: TerminalInitiatePayload): Promise<TerminalTransactionData> {
    return invoke("rbs_terminal_initiate", { payload });
  },

  /* -------------------------- Cancel Terminal --------------------------- */
  cancel(config: RbsPayConfig, transactionId: string): Promise<void> {
    return invoke("rbs_terminal_cancel", {
      config,
      transactionId,
    });
  },

  /* --------------------------- Poll Status ------------------------------ */
  getStatus(
    config: RbsPayConfig,
    transactionId: string
  ): Promise<TerminalTransactionStatus> {
    return invoke("rbs_get_transaction", {
      config,
      transactionId,
    });
  },
};
