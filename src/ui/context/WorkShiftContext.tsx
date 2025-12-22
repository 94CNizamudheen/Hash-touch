
import { createContext, useContext, useEffect, useState, type ReactNode, } from "react";

import type { WorkShiftState } from "@/types/workshift";
import { workShiftLocal } from "@/services/local/workshift.local.service";


interface WorkShiftContextType {
    shift: WorkShiftState | null;
    isHydrated: boolean;

    startShift: (user: string,amount:number) => void;
    endShift: (user: string) => void;
    clear: () => Promise<void>;
}

const WorkShiftContext = createContext<WorkShiftContextType | null>(null);

export const WorkShiftProvider = ({ children }: { children: ReactNode }) => {
    const [shift, setShift] = useState<WorkShiftState | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);


    useEffect(() => {
        const hydrate = async () => {
            try {
                const draft = await workShiftLocal.getDraft();
                if (draft) setShift(draft);
            } catch (e) {
                console.error("WorkShift hydrate failed:", e);
            } finally {
                setIsHydrated(true);
            }
        };
        hydrate();
    }, []);


    useEffect(() => {
        if (!isHydrated) return;
        if (shift) {
            workShiftLocal.saveDraft(shift).catch(console.error);
        }
    }, [shift, isHydrated]);


    const startShift = (user: string, amount: number) => {
        setShift({
            isOpen: true,
            startTime: new Date().toISOString(),
            startedBy: user,
            openTillAmount: amount,
        });
    };

    const endShift = (user: string) => {
        setShift((prev) =>
            prev
                ? {
                    ...prev,
                    isOpen: false,
                    endTime: new Date().toISOString(),
                    endedBy: user,
                }
                : prev
        );
    };

    const clear = async () => {
        setShift(null);
        await workShiftLocal.clear();
    };

    return (
        <WorkShiftContext.Provider
            value={{ shift, isHydrated, startShift, endShift, clear }}
        >
            {children}
        </WorkShiftContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkShift = () => {
    const ctx = useContext(WorkShiftContext);
    if (!ctx)
        throw new Error("useWorkShift must be used within WorkShiftProvider");
    return ctx;
};
