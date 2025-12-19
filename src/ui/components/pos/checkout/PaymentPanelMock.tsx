import { useLocation, useNavigate } from "react-router-dom";
import PaymentPanel from "./PaymentPanel";
import { type OrderItem } from "@/types/common"; 

export default function PaymentPanelMock() {
  const location = useLocation();
  const navigate = useNavigate();

 
  const items = location.state?.items ;
  const total =
    location.state?.total ||
    items.reduce((sum:number, item:OrderItem) => sum + item.price * item.quantity, 0);

  const handleClose = () => navigate(-1);
  const handleConfirm = (method: string) =>
    console.log(`Confirmed payment via ${method}`);

  return (
    <PaymentPanel
      total={total}
      items={items}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
}
