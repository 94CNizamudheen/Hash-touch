
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const TABLEMEMBERS = [
  {
    id: 1,
    code: "648674",
    name: "Normal",
    address: "#01-01/02 LuxAsia Building, Singapore 534118",
  },
  {
    id: 2,
    code: "648674",
    name: "Large",
    address: "#01-01/02 LuxAsia Building, Singapore 534118",
  },
  {
    id: 3,
    code: "648674",
    name: "Small",
    address: "#01-01/02 LuxAsia Building, Singapore 534118",
  },
  {
    id: 4,
    code: "648674",
    name: "Normal",
    address: "#01-01/02 LuxAsia Building, Singapore 534118",
  },
  {
    id: 5,
    code: "648674",
    name: "Normal",
    address: "LuxAsia Building, Singapore 534118",
  },
  {
    id: 6,
    code: "648674",
    name: "Small",
    address: "LuxAsia Building, Singapore 534118",
  },
  {
    id: 7,
    code: "648674",
    name: "Normal",
    address: "LuxAsia Building, Singapore 534118",
  },
  {
    id: 8,
    code: "648674",
    name: "Large",
    address: "LuxAsia Building, Singapore 534118",
  },
  {
    id: 9,
    code: "648674",
    name: "Large",
    address: "LuxAsia Building, Singapore 534118",
  },
  {
    id: 10,
    code: "648674",
    name: "Large",
    address: "LuxAsia Building, Singapore 534118",
  },
];

export type TableMembersType = {
  id?: number;
  code?: string;
  name?: string;
  address?: string;
};


const TableMembers = () => {
  const router = useNavigate();
  const [isActive, setIsActive] = useState(0);
  return (
    <Table>
      <TableHeader className="bg-accent-foreground border-2 border-accent">
        <TableRow>
          <TableHead className="text-center">Code</TableHead>
          <TableHead className="text-center">Name</TableHead>
          <TableHead className="text-center">Address</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {TABLEMEMBERS.map((data) => (
          <TableRow
            key={data.id}
            className={cn(
              "cursor-pointer hover:bg-primary-hover ",
              isActive === data.id ? "bg-primary text-background" : "text-foreground"
            )}
            onClick={() => {
              if (data.id === isActive) {
                setIsActive(0);
                router("/dashboard/staff");
              } else {
                setIsActive(data.id);
                router(`?members=${data.id}`);
              }
            }}
          >
            <TableCell className=" border group-hover:text-white text-center">
              {data.code}
            </TableCell>
            <TableCell className=" border group-hover:text-white text-center">
              {data.name}
            </TableCell>
            <TableCell className=" border group-hover:text-white text-center">
              {data.address}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableMembers;
