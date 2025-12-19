import { Icons } from "../icons"; 
import cashImg from "@/assets/cash.png";
import paytmImg from "@/assets/payments/paytm.jpg";
import stripeImg from "@/assets/payments/stripe.png";

export const CARDPAYMENT = [
  {
    id: 1,
    title: "Cash",
    imgUrl: cashImg,
    icon: Icons.cash ,
  },
  {
    id: 2,
    title: "Scan",
    imgUrl: paytmImg,
    icon: Icons.cash,
  },
  {
    id: 3,
    title: "Card",
    imgUrl: stripeImg,
    icon: Icons.cash,
  },

];
