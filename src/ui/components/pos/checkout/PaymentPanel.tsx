

import { useMediaQuery } from "usehooks-ts";
import PaymentMobile from "./mobile/PaymentMobile";
import PaymentDesktop from "./PaymentDesktop";


export default function PaymentPanel() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return isDesktop ? <PaymentDesktop /> : <PaymentMobile />;
}

