
import { Icons } from "../icons";
import { Home, Settings, Users } from "lucide-react";


export const MENU_NAVIGATION = [
  {
    id: 1,
    title: "Dashboard",
    href: "/dashboard",
    permission: "UI.DASHBOARD.VIEW",
    icon: <Icons.home className="stroke-primary w-5 h-5" />,
  },
  {
    id: 2,
    title: "POS",
    href: "/pos/table-layout",
    permission: "UI.POS.VIEW",
    icon: <Icons.menu className="stroke-primary w-5 h-5" />,
  },
  {
    id: 3,
    title: "Front Desk",
    href: "/front-desk",
    permission: "UI.FRONTDESK.VIEW",
    icon: <Icons.tableManage className="stroke-primary w-5 h-5" />,
  },
  {
    id: 4,
    title: "Members",
    href: "/member",
    permission: "UI.MEMBERS.VIEW",
    icon: <Users className="stroke-primary w-5 h-5" />,
  },
  {
    id: 5,
    title: "Settings",
    href: "/settings",
    permission: "UI.SETTINGS.VIEW",
    icon: <Settings className="stroke-primary w-5 h-5" />,
  },
];



export const LAYOUT_NAVIGATION = [
  {
    id: 1,
    title: "",
    href: "/",
    icon: <Home className="w-5 h-5 text-navigation" />,
    position: "left",
  },
  {
    id: 2,
    title: "Dine-In",
    href: "/pos/table-layout",
    position: "left",
  },
  {
    id: 3,
    title: "Main Floor",
    href: "/pos/table-layout/main-floor",
    position: "center",
  },
  {
    id: 4,
    title: "2nd Floor",
    href: "/pos/table-layout/2nd-floor",
    position: "center",
  },
  {
    id: 5,
    title: "RoofTop",
    href: "/pos/table-layout/roof-top",
    position: "center",
  },
  {
    id: 6,
    title: "Ratio",
    href: "/pos/table-layout/ratio",
    position: "center",
  },
  {
    id: 7,
    title: "All",
    href: "/pos/table-layout/all",
    position: "center",
  },
];