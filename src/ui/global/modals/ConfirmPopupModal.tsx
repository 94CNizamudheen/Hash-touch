// import { useDispatch } from "react-redux";
// import { hidePopup } from "@/store/slices/popupSlice";
// import automationService from "@core/services/automation/automation.service";
// import { HelpCircle } from "lucide-react";

// export default function ConfirmPopupModal({ payload }: { payload: any }) {
//   const dispatch = useDispatch();

//   const title = payload.title;
//   const message = payload.data?.Message;
//   const confirmEvent = payload.data?.ConfirmEvent;
//   const original = payload.data?.__originalPayload ?? {};

//   const handleYes = () => {
//     if (confirmEvent) {
//       console.log(" Firing Confirm Event:", confirmEvent, original);
//       automationService.fire(confirmEvent, original);
//     }
//     dispatch(hidePopup());
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
//       <div className="bg-background p-6 rounded-xl w-[360px] shadow-xl">

//         <div className="flex justify-center mb-3">
//           <HelpCircle className="w-12 h-12 text-yellow-500" />
//         </div>

//         <h2 className="text-xl font-bold text-center">{title}</h2>
//         <p className="text-sm text-center text-accent mb-6">{message}</p>

//         <div className="flex gap-3">
//           <button
//             onClick={() => dispatch(hidePopup())}
//             className="flex-1 py-2 bg-gray-200 rounded-lg"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleYes}
//             className="flex-1 py-2 bg-red-600 text-white rounded-lg"
//           >
//             Yes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
