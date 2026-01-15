import type { GiftCardConfig } from "@/types/giftCard";

export function getGiftCardConfig(
    processor?: string
): GiftCardConfig | null {
    if (!processor) return null;

    try {
        const processors = JSON.parse(processor);
        const giftCard = processors.find(
            (p: any) => p.name === "RBS Gift Card"
        );
        if (!giftCard || !Array.isArray(giftCard.data)) return null;

        const map: Record<string, string> = {};
        for (const d of giftCard.data) {
            if (d?.key && d?.defaultValue) {
                map[d.key] = d.defaultValue;
            }
        }

        if (
            !map.client_id ||
            !map.client_secret ||
            !map.location_id
        ) {
            console.error("Gift card config incomplete", map);
            return null;
        }

        return {
            clientId: map.client_id,
            clientSecret: map.client_secret,
            locationId: map.location_id,

            // optional – only if present in processor
            applicationName: map.application_name,
            terminalId: map.terminal_id,
            baseUrl: map.base_url,
        };

    } catch (e) {
        console.error("Gift card config parse failed", e);
        return null;
    }
}
