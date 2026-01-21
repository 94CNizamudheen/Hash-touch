import { invoke } from "@tauri-apps/api/core";
import { generateUUID } from "@/utils/uuid";

export type DeviceRole = "POS" | "KIOSK" | "QUEUE" | "KDS";

export interface DeviceProfile {
    id: string;
    name: string;
    role: DeviceRole;
    config?: string;
}

export const deviceService = {
    async getDevice(): Promise<DeviceProfile | null> {
        return invoke("get_device");
    },

    async saveDevice(device: DeviceProfile) {
        return invoke("save_device", { device });
    },
    
    async registerDevices(input: { name: string; role: DeviceRole }) {
        const device: DeviceProfile = {
            id: generateUUID(),
            name: input.name,
            role: input.role,
        };

        await invoke("save_device", { device });
        return device;
    },

};
