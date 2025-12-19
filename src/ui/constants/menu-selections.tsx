import {
  Clock,
  LogOut,
  Moon,
  Settings,
  Home,
  MapPin,
  Table,
  Layout,

  Ticket,

  ChartBarBigIcon,
  BriefcaseBusiness,
  MousePointer2Icon,
} from "lucide-react";
import { Icons } from "../icons";

export const MENUSELECTIONNAVIGATION = [
  /* =========================
     TOP SECTION
  ========================= */
  {
    id: 1,
    title: "Member",
    icon: <Icons.member className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
    link: "/member",
  },
  {
    id: 2,
    title: "Shift",
    icon: <Clock className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("shift-end"),
  },
  {
    id: 3,
    title: "Activities",
    icon: <ChartBarBigIcon className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
  },
  {
    id: 4,
    title: "Shift Report",
    icon: < BriefcaseBusiness className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
  },
  {
    id: 5,
    title: "Open Ticket",
    icon: <Ticket className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
  },
  {
    id: 6,
    title: "Cliq",
    icon: <MousePointer2Icon className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
  },
  {
    id: 7,
    title: "Sold out",
    icon: <Icons.soldOut className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
  },
  {
    id: 8,
    title: "Settings",
    icon: <Settings className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
    link: "/settings",
  },
  {
    id: 9,
    title: "Layout",
    icon: <Layout className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("layout"),
  },
  {
    id: 10,
    title: "Dark Mode",
    icon: <Moon className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
    action: () => {
      document.documentElement.classList.toggle("dark");
    },
  },
  {
    id: 11,
    title: "Logout",
    icon: <LogOut className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Top",
    action: (openModal: (c: string) => void) => openModal("logout"),
  },

  /* =========================
     BOTTOM SECTION
  ========================= */
  {
    id: 12,
    title: "Bedok",
    icon: <MapPin className="lg:w-5 lg:h-5 w-6 h-6 text-white" />,
    position: "Bottom",
    action: (openModal: (c: string) => void) => openModal("location"),
    highlight: true, // for blue background
  },
  {
    id: 13,
    title: "Dine In",
    icon: <Table className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Bottom",
    action: (openModal: (c: string) => void) => openModal("dineIn"),
  },
  {
    id: 14,
    title: "Home",
    icon: <Home className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />,
    position: "Bottom",
    link: "/dashboard",
  },
];
