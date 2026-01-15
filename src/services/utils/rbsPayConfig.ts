import { parseProcessor } from "../local/payment-method.local.service";
import { terminalService, type RbsPayConfig, type TerminalTransactionStatus } from "../local/terminal.local.service";

export function getRbsPayConfig(processor?: string) {
    const processors = parseProcessor(processor);
    const rbs = processors.find(p => p.name === "RBSPay");

    if (!rbs) return null;

    const get = (key: string) =>
        rbs.data.find(d => d.key === key)?.defaultValue?.trim() || "";

    const config = {
        api_key: get("api_key"),
        base_url: get("base_url"),
        terminal_id: get("terminal_id"),
    };

    if (!config.api_key || !config.base_url || !config.terminal_id) {
        console.error("RBSPay config incomplete:", config);
        return null;
    }

    return config;
}

export async function pollTerminalTransaction({
    config,
    transactionId,
    intervalMs = 2000,
    timeoutMs = 60000,
    onStatusUpdate,
}: {
    config: RbsPayConfig;
    transactionId: string;
    intervalMs?: number;
    timeoutMs?: number;
    onStatusUpdate?: (status: TerminalTransactionStatus) => void;
}) {
    const start = Date.now();
    let attempt = 0;

    while (true) {
        attempt++;
        
        try {
            const status = await terminalService.getStatus(config, transactionId);

            console.log(`[Poll Attempt ${attempt}]`, {
                status: status.status,
                response: status.response,
                code: status.processor_response_code,
            });

            // Notify caller of status update
            if (onStatusUpdate) {
                onStatusUpdate(status);
            }

            // Check for final states (case-insensitive)
            const statusUpper = status.status?.toUpperCase() || "";
            
            const finalStates = [
                "APPROVED",
                "DECLINED", 
                "FAILED", 
                "REJECTED",
                "PENDINGSETTLEMENT", // ← Added this!
            ];

            if (finalStates.includes(statusUpper)) {
                console.log(`✅ Terminal reached final state: ${status.status}`);
                return status;
            }

            // Check timeout
            const elapsed = Date.now() - start;
            if (elapsed > timeoutMs) {
                console.error(`⏱️ Polling timeout after ${elapsed}ms`);
                throw new Error("Terminal transaction timeout");
            }

            console.log(`⏳ Still polling... (${elapsed}ms elapsed, next in ${intervalMs}ms)`);

            // Wait before next poll
            await new Promise(res => setTimeout(res, intervalMs));

        } catch (error: any) {
            console.error(`[Poll Attempt ${attempt}] Error:`, error.message);

            const elapsed = Date.now() - start;
            if (elapsed > timeoutMs) {
                throw error;
            }

            // Wait before retry on error
            await new Promise(res => setTimeout(res, intervalMs));
        }
    }
}