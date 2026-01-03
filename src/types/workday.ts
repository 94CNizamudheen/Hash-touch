

export interface WorkdayPayload {
    start_user?: string;
    end_user?: string;
    start_time?: string;
    end_time?: string;
    location_id: string;
    total_sales?: number;
    total_taxes?: number;
    total_ticket_count?: number;
    work_period_informations?: string;
    department_ticket_informations?: string;
    add_on?: string;
    auto_closed?: boolean;
    external_processed?: boolean;
    work_period_day?: string;
    business_date?: string;
}

export interface WorkdayResponse {
    status: number;
    wid: string;
}

export interface WorkdayUpdateResponse {
    status: number;
    wid: string;
}

export interface LocalWorkday {
    id: number;
    workdayId?: string;
    startUser?: string;
    endUser?: string;
    startTime?: string;
    endTime?: string;
    locationId: string;
    totalSales?: number;
    totalTaxes?: number;
    totalTicketCount?: number;
    workPeriodInformations?: string;
    departmentTicketInformations?: string;
    addOn?: string;
    autoClosed?: boolean;
    externalProcessed?: boolean;
    workPeriodDay?: string;
    businessDate?: string;
    syncStatus: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
    syncError?: string;
    createdAt: string;
    updatedAt?: string;
}
