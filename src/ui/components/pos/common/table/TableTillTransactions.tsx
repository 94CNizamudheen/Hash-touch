import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { cn } from "@/utils";

export const TABLETILLTRANSACTIONS = [
    {
        id: 1,
        no: "01",
        till_account: "Cash Out",
        date: "26/8/2024 12:03:08 PM",
        remark: "Grab Return",
        total: "1000.00",
    },
    {
        id: 2,
        no: "02",
        till_account: "Cash In",
        date: "26/8/2024 12:03:08 PM",
        remark: "Grab Return",
        total: "1000.00",
    },
    {
        id: 3,
        no: "03",
        till_account: "Cash Out",
        date: "26/8/2024 12:03:08 PM",
        remark: "Grab Return",
        total: "150.00",
    },
    {
        id: 4,
        no: "04",
        till_account: "Cash In",
        date: "26/8/2024 12:03:08 PM",
        remark: "Grab Return",
        total: "150.00",
    },
    {
        id: 5,
        no: "05",
        till_account: "Cash Out",
        date: "26/8/2024 12:03:08 PM",
        remark: "Grab Return",
        total: "150.00",
    },
];


const TableTillTransactions = () => {
    return (
        <Table>
            <TableHeader className="bg-accent-foreground">
                <TableRow>
                    <TableHead className="text-start">S.No</TableHead>
                    <TableHead className="text-start">Till Account</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Remark</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="">
                {TABLETILLTRANSACTIONS.map((data) => (
                    <TableRow
                        key={data.id}
                        className={cn("cursor-pointer hover:bg-primary-hover")}
                    >
                        <TableCell className=" border group-hover:text-white">
                            {data.no}
                        </TableCell>
                        <TableCell className=" border group-hover:text-white">
                            {data.till_account}
                        </TableCell>
                        <TableCell className=" border group-hover:text-white">
                            {data.date}
                        </TableCell>
                        <TableCell className="text-right  border group-hover:text-white">
                            {data.remark}
                        </TableCell>
                        <TableCell className="text-right border group-hover:text-white">
                            {data.total}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default TableTillTransactions;
