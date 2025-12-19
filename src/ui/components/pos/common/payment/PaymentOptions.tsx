import { CARDPAYMENT } from "@/ui/constants/card-payment";
import CardPayment from "../card/CardPayment";


const PaymentOptions = () => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex gap-3 min-w-max justify-center px-2">
        {CARDPAYMENT.map((item) => (
          <div key={item.id} className="flex-shrink-0">
            <CardPayment
              title={item.title}
              imgUrl={item.imgUrl}
              icon={<item.icon className="w-3.5 h-3.5 text-black" />}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentOptions;
