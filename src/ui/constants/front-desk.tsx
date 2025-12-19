import { Briefcase } from "lucide-react";
import { Icons } from "../icons"; 


export const FRONTDESKMENU = [
  {
    id: 1,
    title: "Reports",
    permission:"UI.REPORTS.VIEW",
    icon: (
      <Icons.reports_second className="fill-primary " />
    ),
    href: "/front-desk/reports",
  },
  {
    id: 2,
    title: "Sold Out",
    permission:"UI.SOLDOUT.VIEW",
    icon: (
      <Icons.soldOut className="fill-primary" />
    ),
    href: "/front-desk/sold-out",
  },
  {
    id: 3,
    title: "Till Transactions",
    permission:"UI.TILLTRANSACTIONS.VIEW",
    icon: (
      <Icons.money className="stroke-primary " />
    ),
    href: "/front-desk/till-transaction",
  },
  {
    id: 4,
    title: "Reserve",
    permission:"UI.RESERVE.VIEW",
    icon: (
      <Icons.reserve className="fill-primary " />
    ),
    href: "/front-desk/reserve",
  },
  {
    id: 5,
    title: "Message",
    permission:"UI.MESSAGE.VIEW", 
    icon: (
      <Icons.message className="stroke-primary" />
    ),
    href: "/front-desk/message",
  },
  {
    id: 6,
    title: "Short Message",
    permission:"UI.SHORTMESSAGE.VIEW",
    icon: (
      <Icons.shortMessage className="fill-primary" />
    ),
    href: "/front-desk/short-message",
  },
  {
    id: 7,
    title: "Workday",
    permission:"UI.WORKDAY.VIEW",
    icon: (
      <Briefcase className="h-[100%] w-[100%]" />
    ),
    href: "/front-desk/workday",
  },
];
