
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils";

export const TABLESOLDOUT = [
  {
    id: 1,
    productName: "Hot Fudge Brownies",
    portion: "Normal",
    counter: "24.00",
    user: "Admin",
  },
  {
    id: 2,
    productName: "Hot Fudge Brownies",
    portion: "Large",
    counter: "23.00",
    user: "Admin",
  },
  {
    id: 3,
    productName: "Hot Fudge Brownies",
    portion: "Small",
    counter: "12.00",
    user: "Admin",
  },
  {
    id: 4,
    productName: "Hot Fudge Brownies",
    portion: "Normal",
    counter: "40.00",
    user: "Admin",
  },
  {
    id: 5,
    productName: "Hot Fudge Brownies",
    portion: "Normal",
    counter: "50.00",
    user: "Admin",
  },
  {
    id: 6,
    productName: "Hot Fudge Brownies",
    portion: "Small",
    counter: "21.00",
    user: "Admin",
  },
  {
    id: 7,
    productName: "Hot Fudge Brownies",
    portion: "Large",
    counter: "44.00",
    user: "Admin",
  },
  {
    id: 8,
    productName: "Hot Fudge Brownies",
    portion: "Large",
    counter: "42.00",
    user: "Admin",
  },
  {
    id: 9,
    productName: "Hot Fudge Brownies",
    portion: "Large",
    counter: "42.00",
    user: "Admin",
  },
];


const TableSoldOut = () => {
  return (
    <Table>
      <TableHeader className="bg-background ">
        <TableRow>
          <TableHead className="w-[300px] border-2 ">Product Name</TableHead>
          <TableHead className="text-center border-2">Portion</TableHead>
          <TableHead className="text-center border-2">Counter</TableHead>
          <TableHead className="text-center border-2">User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {TABLESOLDOUT.map((data) => (
          <TableRow
            key={data.id}
            className={cn("cursor-pointer hover:bg-primary-hover group ")}
          >
            <TableCell className="border group-hover:text-background ">
              {data.productName}
            </TableCell>
            <TableCell className="border ">
              {data.portion}
            </TableCell>
            <TableCell className=" border ">
              {data.counter}
            </TableCell>
            <TableCell className="text-right  border ">
              {data.user}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSoldOut;
