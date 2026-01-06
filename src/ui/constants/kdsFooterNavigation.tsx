
import { Home, CheckCircle2, RefreshCcw } from "lucide-react";

export interface KdsFooterNavItem {
  id: number;
  title: string;
  icon: React.ReactNode;
  link?: string;
  action?: () => void;
  variant?: "primary" | "navigation" | "warning";
}

export const KDS_FOOTER_NAVIGATION: KdsFooterNavItem[] = [
  {
    id: 1,
    title: "Home",
    icon: <Home className="w-4 h-4" />,
    link: "/kds",
    variant: "navigation",
  },
  {
    id: 2,
    title: "Ready Tickets",
    icon: <CheckCircle2 className="w-4 h-4" />,
    link: "/kds/completed",
    variant: "navigation",
  },
  {
    id: 3,
    title: "Refresh",
    icon: <RefreshCcw className="w-4 h-4" />,
    action: () => window.location.reload(),
    variant: "warning",
  },
];
