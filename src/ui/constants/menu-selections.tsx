import {
  Clock,
  LogOut,
  Settings,
  Home,
  MapPin,
  Table,
  Layout,
  // Ticket,
  ChartBarBigIcon,
  Globe,
  Flag,
  Monitor,
  // BriefcaseBusiness,
  // MousePointer2Icon,
} from "lucide-react";
// import { Icons } from "../icons";

import { MdOutlineCloudSync } from "react-icons/md";

export const MENUSELECTIONNAVIGATION = [

  {
    id: 1,
    title: "Shift",
    icon: <Clock className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("shift"),
  },
  {
    id: 2,
    title: "Activities",
    icon: <ChartBarBigIcon className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    link: "/pos/activity",
  },
  {
    id: 3,
    title: "Sold Out",
    icon: <Flag className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    link: "/pos/sold-out",
  },
    {
    id: 4,
    title: "Start Sync",
    icon: <MdOutlineCloudSync className="lg:w-4 lg:h-4 w-4 h-4"  />,
    position: "Top",
    link: "",
  },
  {
    id: 5,
    title: "Settings",
    icon: <Settings className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    link: "/pos/settings",
  },
  {
    id: 6,
    title: "Change Style",
    icon: <Layout className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("layout"),
  },
  {
    id: 7,
    title: "Dark Mode",
    icon: null,
    position: "Top",

  },

  {
    id: 8,
    title: "Language",
    icon: <Globe className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("language"),
  },
  {
    id: 9,
    title: "Direction",
    icon: null,
    position: "Top",
  },
    {
    id: 10,
    title: "Logout",
    icon: <LogOut className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("logout"),
  },



  /* =========================
     BOTTOM SECTION
  ========================= */
  {
    id: 11,
    title: "Switch Device",
    icon: <Monitor className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Bottom",
    action: (openModal: (c: string) => void) => openModal("switchDevice"),
  },
  {
    id: 12,
    title: "Location",
    icon: <MapPin className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Bottom",
    action: (openModal: (c: string) => void) => openModal("location"),
    highlight: true, // for blue background
  },

  {
    id: 13,
    title: "Dine In",
    icon: <Table className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Bottom",
    action: (openModal: (c: string) => void) => openModal("dineIn"),
  },
  {
    id: 14,
    title: "Home",
    icon: <Home className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Bottom",
    link: "/pos",
  },
];
