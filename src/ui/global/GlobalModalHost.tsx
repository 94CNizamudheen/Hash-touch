// import { useSelector } from "react-redux";
// import { RootState } from "@/store/store";

// import InfoPopupModal from "./modals/InfoPopupModal";
// import ConfirmPopupModal from "./modals/ConfirmPopupModal";
// import WorkdayInfoModal from "@/components/pos/work-day/modals/WorkDayInfoModal";

// export default function GlobalModalHost() {
//   const popup = useSelector((s: RootState) => s.popup.popup);

//   if (!popup) return null;

//   switch (popup.type) {
//     case "workday":
//       return <WorkdayInfoModal />;

//     case "confirm":
//       return <ConfirmPopupModal payload={popup} />;

//     case "info":
//     case "success":
//     case "error":
//     default:
//       return <InfoPopupModal payload={popup} />;
//   }
// }
