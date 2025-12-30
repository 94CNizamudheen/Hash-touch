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
  // BriefcaseBusiness,
  // MousePointer2Icon,
} from "lucide-react";
// import { Icons } from "../icons";



export const MENUSELECTIONNAVIGATION = [

  {
    id: 2,
    title: "Shift",
    icon: <Clock className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("shift"),
  },
  {
    id: 3,
    title: "Activities",
    icon: <ChartBarBigIcon className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    link: "/pos/activity",
  },

  {
    id: 8,
    title: "Settings",
    icon: <Settings className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    link: "/pos/settings",
  },
  {
    id: 9,
    title: "Change Style",
    icon: <Layout className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("layout"),
  },
  {
    id: 10,
    title: "Dark Mode",
    icon: null,
    position: "Top",

  },
  {
    id: 11,
    title: "Logout",
    icon: <LogOut className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("logout"),
  },
  {
    id: 14,
    title: "Language",
    icon: <Globe className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("language"),
  },


  /* =========================
     BOTTOM SECTION
  ========================= */

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
    {
    id: 12,
    title: "Location",
    icon: <MapPin className="lg:w-4 lg:h-4 w-4 h-4" strokeWidth={2.5} />,
    position: "Bottom",
    action: (openModal: (c: string) => void) => openModal("location"),
    highlight: true, // for blue background
  },
];
