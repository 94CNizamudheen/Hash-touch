// import { useEffect } from "react";
// import { eventBus } from "@core/events/local-event-bus";

// export default function AutomationCommandListener() {
//   useEffect(() => {
//     const handler = (payload: any) => {
//       console.log("[Automation Command Executed]", payload);

//       if (payload?.CommandName === "OpenSettings") {
//         window.location.href = "/settings";
//       }
//     };

//     eventBus.on("automation-command", handler);

//     return () => eventBus.off("automation-command", handler);
//   }, []);

//   return null;
// }
