import {   Table, TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import { cn } from "@/utils";
import { WorkDay } from "@core/services/workday.service";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedWorkday } from "@/store/slices/workdaySlice";
import { RootState } from "@/store/store";
import { useTranslation } from "react-i18next";

interface Props {
    rows: WorkDay[];
    loading: boolean;
}

const TableWorkDay = ({ rows, loading }: Props) => {
    const {t}= useTranslation()
    const selectedRow = useSelector((s: RootState) => s.workday.selectedRow);
    const time = (value?: number | null) =>
        value ? new Date(value * 1000).toLocaleString() : "-";

    const dateOnly = (value: string) =>
        value ? new Date(value).toLocaleDateString("en-GB") : "-";

    if (loading) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                Loading...
            </div>
        );
    }
    const dispatch=useDispatch();


    return (
        <div className="border border-border rounded-xl shadow-sm overflow-hidden">
            

            <Table>
                <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className="text-center font-semibold">{t(`Start Time`)} </TableHead>
                        <TableHead className="text-center font-semibold">{t(`End Time`)}</TableHead>
                        <TableHead className="text-center font-semibold">{t(`Terminal`)}</TableHead>
                        <TableHead className="text-center font-semibold">{t(`Start User`)}</TableHead>
                        <TableHead className="text-center font-semibold">{t(`End User`)}</TableHead>
                        <TableHead className="text-center font-semibold">{t(`Business Date`)}</TableHead>
                        <TableHead className="text-center font-semibold">{t(`Total Sales`)}</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow
                            key={row.id}
                            onClick={()=>dispatch(setSelectedWorkday(row))}
                            className={cn(
                                "cursor-pointer transition-all h-14",
                                index % 2 === 0 ? "bg-background" : "bg-muted/20",
                                "hover:bg-primary-hover hover:text-background",
                                selectedRow?.id === row.id&&
                                "bg-primary text-primary-foreground border-l-4 border-primary"
                            )}
                        >
                            <TableCell className="text-center">{time(row.start_time)}</TableCell>
                            <TableCell className="text-center">{time(row.end_time)}</TableCell>
                            <TableCell className="text-center">Server</TableCell>
                            <TableCell className="text-center">{row.opened_by_name||row.opened_by_id ||"-"}</TableCell>
                            <TableCell className="text-center">{row.closed_by_name || "-"}</TableCell>
                            <TableCell className="text-center">{dateOnly(row.open_date)}</TableCell>
                            <TableCell className="text-center font-semibold">
                                {row.total_sales.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TableWorkDay;
