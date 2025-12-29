
// import { useEffect } from "react";
// import { useNotification } from "../context/NotificationContext";
// import { eventBus } from "@core/events/local-event-bus";

// export default function AutomationNotificationListener() {
//   const { showNotification } = useNotification();

// useEffect(() => {
//   type NotificationKey = "success" | "error" | "warning" | "info";

//   const handler = (payload: { Type?: NotificationKey; Message: string }) => {
//     const type: NotificationKey = payload.Type ?? "info";
//     showNotification[type](payload.Message);
//   };

//   eventBus.on("notify", handler);
//   return () => eventBus.off("notify", handler);
// }, []);


//   return null;
// }
