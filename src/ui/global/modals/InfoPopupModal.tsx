// import { useDispatch } from "react-redux";
// import { hidePopup } from "@/store/slices/popupSlice";
// import { getLucideIcon } from "@/utils/iconMap";
// import { CheckCircle, AlertTriangle, Info, HelpCircle } from "lucide-react";

// export default function InfoPopupModal({ payload }: { payload: any }) {
//   const dispatch = useDispatch();

//   const type = payload.type ?? "info";
//   const title = payload.title ?? "Info";
//   const msg = payload.message ?? "";
//   const data = payload.data || {};
//   let Icon = getLucideIcon(payload.icon);

//   if (!Icon) {
//     switch (type) {
//       case "success":
//         Icon = CheckCircle;
//         break;
//       case "error":
//         Icon = AlertTriangle;
//         break;
//       case "confirm":
//         Icon = HelpCircle;
//         break;
//       default:
//         Icon = Info;
//     }
//   }

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
//       <div className="bg-background rounded-xl p-6 shadow-xl w-[360px] animate-fadeIn">

//         {/* Icon */}
//         <div className="flex justify-center mb-3">
//           <Icon className="w-12 h-12 text-primary" />
//         </div>

//         {/* Title */}
//         <h2 className="text-xl font-bold text-center mb-2">{title}</h2>

//         <p className="text-sm text-accent text-center mb-4">{msg}</p>

//         <div className="text-sm space-y-1">
//           {Object.entries(data).map(([k, v]) => (
//             <div key={k}>
//               <b>{k}:</b> {String(v)}
//             </div>
//           ))}
//         </div>

//         <button
//           onClick={() => dispatch(hidePopup())}
//           className="mt-6 w-full bg-primary text-white py-2 rounded-lg"
//         >
//           OK
//         </button>
//       </div>
//     </div>
//   );
// }
