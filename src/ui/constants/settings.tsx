
import { Wifi } from "lucide-react";
import { Icons } from "../icons";

export const SETTINGS_MENU = [
  {
    id: 1,
    title: "Printer Settings",
    icon: <Icons.printer className="stroke-primary" />,
    href: "/pos/settings/printers",
  },
  {
    id: 2,
    title: "Device Communication",
    icon: <Wifi className="stroke-primary" />,
    href: "/pos/settings/devices",
  },
];
