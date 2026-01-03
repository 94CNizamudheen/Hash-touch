
import { createContext, useContext, useEffect, useState, type ReactNode, } from "react";

import type { WorkShiftState } from "@/types/workshift";
import { workShiftLocal } from "@/services/local/workshift.local.service";
import { workdayDataService } from "@/services/data/workday.data.service";
import { workdayLocal } from "@/services/local/workday.local.service";
import { ticketLocal } from "@/services/local/ticket.local.service";
import { useAppState } from "./AppStateContext";
import type { WorkdayPayload } from "@/types/workday";
import type { TicketRequest } from "@/types/ticket";


interface WorkShiftContextType {
    shift: WorkShiftState | null;
    isHydrated: boolean;

    startShift: (user: string, amount: number) => Promise<void>;
    endShift: (user: string) => Promise<void>;
    clear: () => Promise<void>;
}

const WorkShiftContext = createContext<WorkShiftContextType | null>(null);

export const WorkShiftProvider = ({ children }: { children: ReactNode }) => {
    const [shift, setShift] = useState<WorkShiftState | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const { state: appState } = useAppState();

    /**
     * Calculate totals from all tickets for the current shift
     */
    const calculateShiftTotals = async (businessDate: string, locationId: string) => {
        try {
            console.log("📊 Calculating shift totals for:", { businessDate, locationId });

            const allTickets = await ticketLocal.getAll();

            // Filter tickets for this business date and location
            const relevantTickets = allTickets.filter(dbTicket => {
                if (dbTicket.location_id !== locationId) return false;

                try {
                    const ticketRequest: TicketRequest = JSON.parse(dbTicket.ticket_data);
                    return ticketRequest.ticket.business_date === businessDate;
                } catch {
                    return false;
                }
            });

            console.log(`📋 Found ${relevantTickets.length} tickets for this shift`);

            let totalSales = 0;
            let totalTaxes = 0;

            relevantTickets.forEach(dbTicket => {
                try {
                    const ticketRequest: TicketRequest = JSON.parse(dbTicket.ticket_data);

                    // Add ticket amount (convert from cents to dollars)
                    const ticketAmount = (dbTicket.ticket_amount || 0) / 100;
                    totalSales += ticketAmount;

                    // Calculate total taxes from orders
                    ticketRequest.orders.forEach(order => {
                        const taxAmount = parseFloat(order.tax_amount || '0');
                        totalTaxes += taxAmount;
                    });
                } catch (error) {
                    console.error("Failed to parse ticket:", error);
                }
            });

            const totals = {
                totalSales: Math.round(totalSales * 100) / 100, // Round to 2 decimals
                totalTaxes: Math.round(totalTaxes * 100) / 100,
                totalTicketCount: relevantTickets.length,
            };

            console.log("💰 Calculated totals:", totals);

            return totals;
        } catch (error) {
            console.error("❌ Failed to calculate shift totals:", error);
            return {
                totalSales: 0,
                totalTaxes: 0,
                totalTicketCount: 0,
            };
        }
    };


    useEffect(() => {
        const hydrate = async () => {
            try {
                const draft = await workShiftLocal.getDraft();
                if (draft) {
                    console.log("📋 Hydrated shift from storage:", draft);

                    // Check if this is an old shift without workday IDs
                    if (!draft.workdayId && !draft.localWorkdayId) {
                        console.log("⚠️ Old shift detected without workday IDs - attempting to link with active workday");

                        // Try to find an active workday in the database
                        try {
                            const activeWorkday = await workdayLocal.getActive();
                            if (activeWorkday) {
                                console.log("✅ Found active workday:", activeWorkday);
                                draft.workdayId = activeWorkday.workdayId;
                                draft.localWorkdayId = activeWorkday.id;
                                console.log("🔗 Linked shift with workday:", { workdayId: activeWorkday.workdayId, localWorkdayId: activeWorkday.id });
                            } else {
                                console.log("⚠️ No active workday found - workday will be created on shift end");
                            }
                        } catch (error) {
                            console.error("❌ Failed to find active workday:", error);
                        }
                    }

                    setShift(draft);
                }
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


    const startShift = async (user: string, amount: number) => {
        const startTime = new Date().toISOString();
        const businessDate = new Date().toISOString().split("T")[0];

        console.log("🚀 Starting shift:", {
            user,
            amount,
            hasTenantDomain: !!appState?.tenant_domain,
            hasAccessToken: !!appState?.access_token,
            hasLocationId: !!appState?.selected_location_id,
        });

        // Update local state immediately
        const newShift: WorkShiftState = {
            isOpen: true,
            startTime,
            startedBy: user,
            openTillAmount: amount,
        };
        setShift(newShift);

        // Sync with API if we have the required data
        if (appState?.tenant_domain && appState?.access_token && appState?.selected_location_id) {
            try {
                const workdayPayload: WorkdayPayload = {
                    location_id: appState.selected_location_id,
                    start_user: user,
                    start_time: startTime,
                    work_period_day: businessDate,
                    business_date: businessDate,
                    total_sales: 0,
                    total_taxes: 0,
                    total_ticket_count: 0,
                    auto_closed: false,
                    external_processed: false,
                };

                console.log("📡 Calling sync-workdays API...");

                // Try to sync online
                const response = await workdayDataService.syncWorkday(
                    appState.tenant_domain,
                    appState.access_token,
                    workdayPayload
                );

                console.log("✅ Workday started on server:", response);

                // Save to local DB with SYNCED status
                const localId = await workdayLocal.save(workdayPayload, {
                    workdayId: response.wid,
                    syncStatus: "SYNCED",
                });

                console.log("💾 Saved to local DB:", { workdayId: response.wid, localId });

                // Update shift with server IDs
                setShift(prev => prev ? {
                    ...prev,
                    workdayId: response.wid,
                    localWorkdayId: localId,
                } : prev);

                console.log("✅ Shift state updated with IDs");

            } catch (error) {
                console.error("❌ Failed to sync workday start:", error);

                // Save offline with PENDING status
                if (appState.selected_location_id) {
                    console.log("💾 Saving to local DB (offline mode)...");

                    const workdayPayload: WorkdayPayload = {
                        location_id: appState.selected_location_id,
                        start_user: user,
                        start_time: startTime,
                        work_period_day: businessDate,
                        business_date: businessDate,
                        total_sales: 0,
                        total_taxes: 0,
                        total_ticket_count: 0,
                        auto_closed: false,
                        external_processed: false,
                    };

                    const localId = await workdayLocal.save(workdayPayload, {
                        syncStatus: "PENDING",
                    });

                    console.log("✅ Saved offline with localId:", localId);

                    setShift(prev => prev ? {
                        ...prev,
                        localWorkdayId: localId,
                    } : prev);
                }
            }
        } else {
            console.log("⚠️ Skipping API call - missing required credentials");
        }
    };

    const endShift = async (user: string) => {
        const endTime = new Date().toISOString();

        // Capture current shift data BEFORE updating state
        let currentWorkdayId = shift?.workdayId;
        let currentLocalWorkdayId = shift?.localWorkdayId;

        console.log("🔚 Ending shift:", {
            workdayId: currentWorkdayId,
            localWorkdayId: currentLocalWorkdayId,
            hasTenantDomain: !!appState?.tenant_domain,
            hasAccessToken: !!appState?.access_token,
        });

        // If no workdayId exists, create one retroactively
        if (!currentWorkdayId && appState?.tenant_domain && appState?.access_token && appState?.selected_location_id && shift) {
            console.log("⚠️ No workday ID found - creating workday retroactively");

            try {
                const businessDate = shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

                const workdayPayload: WorkdayPayload = {
                    location_id: appState.selected_location_id,
                    start_user: shift.startedBy || user,
                    start_time: shift.startTime || new Date().toISOString(),
                    work_period_day: businessDate,
                    business_date: businessDate,
                    total_sales: 0,
                    total_taxes: 0,
                    total_ticket_count: 0,
                    auto_closed: false,
                    external_processed: false,
                };

                const response = await workdayDataService.syncWorkday(
                    appState.tenant_domain,
                    appState.access_token,
                    workdayPayload
                );

                console.log("✅ Workday created retroactively:", response);

                // Save to local DB
                const localId = await workdayLocal.save(workdayPayload, {
                    workdayId: response.wid,
                    syncStatus: "SYNCED",
                });

                currentWorkdayId = response.wid;
                currentLocalWorkdayId = localId;

                console.log("💾 Saved retroactive workday:", { workdayId: response.wid, localId });
            } catch (error) {
                console.error("❌ Failed to create retroactive workday:", error);
            }
        }

        // Update local state immediately
        setShift((prev) =>
            prev
                ? {
                    ...prev,
                    isOpen: false,
                    endTime,
                    endedBy: user,
                    workdayId: currentWorkdayId,
                    localWorkdayId: currentLocalWorkdayId,
                }
                : prev
        );

        // Sync with API if we have the required data
        if (currentWorkdayId && appState?.tenant_domain && appState?.access_token && appState?.selected_location_id) {
            try {
                console.log("📡 Calling update-workday API...");

                // Calculate actual totals from tickets
                const businessDate = shift?.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
                const totals = await calculateShiftTotals(businessDate, appState.selected_location_id);

                const response = await workdayDataService.endWorkday(
                    appState.tenant_domain,
                    appState.access_token,
                    currentWorkdayId,
                    appState.selected_location_id,
                    user,
                    totals
                );

                console.log("✅ Workday ended on server:", response);

                // Update local DB
                if (currentLocalWorkdayId) {
                    await workdayLocal.updateSyncStatus(currentLocalWorkdayId, "SYNCED");
                }

            } catch (error) {
                console.error("❌ Failed to sync workday end:", error);

                // Mark as pending sync
                if (currentLocalWorkdayId) {
                    await workdayLocal.updateSyncStatus(currentLocalWorkdayId, "PENDING");
                }
            }
        } else {
            console.log("⚠️ Skipping API call - missing required data:", {
                hasWorkdayId: !!currentWorkdayId,
                hasTenantDomain: !!appState?.tenant_domain,
                hasAccessToken: !!appState?.access_token,
                hasLocationId: !!appState?.selected_location_id,
            });

            // Update local workday without server sync
            if (currentLocalWorkdayId && appState?.selected_location_id) {
                try {
                    await workdayLocal.update(currentLocalWorkdayId, {
                        end_user: user,
                        end_time: endTime,
                        location_id: appState.selected_location_id,
                    });
                    console.log("✅ Updated local workday");
                } catch (error) {
                    console.error("❌ Failed to update local workday:", error);
                }
            }
        }
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
