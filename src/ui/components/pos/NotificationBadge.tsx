// import { useEffect, useState } from "react";
// import { Bell, X } from "lucide-react";
// import { eventBus } from "@core/events/local-event-bus";
// import { Button } from "@/components/ui/button";
// import { Howl } from "howler";
// import notificationSound from "../../assets/new-notification.mp3";
// import { useNotification } from "@/context/NotificationContext";
// import { OrderReadyPayload } from "@db/types";


// interface NotificationMessage {
//     id: string;
//     text: string;
//     timestamp: Date;
//     read: boolean;
// }

// export default function NotificationBadge() {
//     const [count, setCount] = useState(0);
//     const [messages, setMessages] = useState<NotificationMessage[]>([]);
//     const [isOpen, setIsOpen] = useState(false);
//     const { showNotification } = useNotification();


//     const playNotificationSound = () => {
//         try {
//             const sound = new Howl({ src: [notificationSound] });
//             sound.play();
//         } catch (error) {
//             showNotification.error(`Failed to play notification sound: ${error}`);
//         }
//     };


//     useEffect(() => {
//         const seenOrders = new Set<string>();

//         const handleOrderReady = (payload: OrderReadyPayload) => {
//             if (payload?.sender === "pos") return; // ignore self events

//             const orderId = payload?.order_id || payload?.order_id;
//             if (!orderId) return;
//             if (seenOrders.has(orderId)) {
//                 console.log("Duplicate order ready ignored:", orderId);
//                 return;
//             }
//             seenOrders.add(orderId);
//             setTimeout(() => seenOrders.delete(orderId), 3000);

//             const text =
//                 payload?.token && orderId
//                     ? `Order #${orderId} is ready for pickup — Token ${payload.token}`
//                     : payload?.message || "New order ready notification";

//             const newMessage = {
//                 id: Date.now().toString(),
//                 text,
//                 timestamp: new Date(),
//                 read: false,
//             };

//             setMessages((prev) => [newMessage, ...prev]);
//             setCount((prev) => prev + 1);

//             showNotification.success(text);
//             playNotificationSound();
//         };

//         eventBus.off("order:ready", handleOrderReady);
//         eventBus.on("order:ready", handleOrderReady);

//         return () => eventBus.off("order:ready", handleOrderReady);
//     }, []);

//     const toggleSidebar = () => {
//         setIsOpen((prev) => !prev);

//         if (!isOpen && count > 0) {
//             setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
//             setCount(0);
//         }
//     };


//     const clearNotifications = () => {
//         setMessages([]);
//         setCount(0);
//     };


//     const removeNotification = (id: string) => {
//         setMessages((prev) => prev.filter((msg) => msg.id !== id));
//     };


//     const formatTime = (date: Date) => {
//         const diff = Date.now() - date.getTime();
//         const minutes = Math.floor(diff / 60000);
//         const hours = Math.floor(diff / 3600000);

//         if (minutes < 1) return "Just now";
//         if (minutes < 60) return `${minutes}m ago`;
//         if (hours < 24) return `${hours}h ago`;
//         return date.toLocaleDateString();
//     };

//     return (
//         <>

//             <button
//                 onClick={toggleSidebar}
//                 className="relative p-2 bg-amber-300 hover:bg-gray-500 rounded-lg transition-colors"
//                 aria-label="Notifications"
//             >
//                 <Bell className="h-6 w-6 text-gray-700" />
//                 {count > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
//                         {count > 99 ? "99+" : count}
//                     </span>
//                 )}
//             </button>

//             {/* Overlay */}
//             {isOpen && (
//                 <div
//                     className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all"
//                     onClick={toggleSidebar}
//                 />
//             )}

//             {/* Notification Sidebar */}
//             <div
//                 className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
//                     }`}
//             >
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-4 border-b bg-blue-500 text-white">
//                     <div className="flex items-center gap-3">
//                         <Bell className="h-6 w-6" />
//                         <div>
//                             <h2 className="text-lg font-semibold">Notifications</h2>
//                             <p className="text-xs text-blue-100">{messages.length} total</p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={toggleSidebar}
//                         className="p-1 hover:bg-blue-600 rounded-lg transition-colors"
//                     >
//                         <X className="h-5 w-5" />
//                     </button>
//                 </div>

//                 {/* Clear All */}
//                 {messages.length > 0 && (
//                     <div className="p-3 border-b bg-gray-50">
//                         <Button
//                             size="sm"
//                             variant="outline"
//                             className="w-full text-sm"
//                             onClick={clearNotifications}
//                         >
//                             Clear All Notifications
//                         </Button>
//                     </div>
//                 )}

//                 {/* List */}
//                 <div className="overflow-y-auto h-[calc(100vh-180px)]">
//                     {messages.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
//                             <Bell className="h-16 w-16 mb-4 opacity-20" />
//                             <p className="text-lg font-medium">No notifications</p>
//                             <p className="text-sm text-center mt-2">
//                                 You're all caught up! Check back later for updates.
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="divide-y">
//                             {messages.map((msg) => (
//                                 <div
//                                     key={msg.id}
//                                     className={`p-4 hover:bg-gray-50 transition-colors ${!msg.read ? "bg-blue-50" : ""
//                                         }`}
//                                 >
//                                     <div className="flex items-start justify-between gap-3">
//                                         <div className="flex-1 min-w-0">
//                                             <p className="text-sm text-gray-900 break-words">
//                                                 {msg.text}
//                                             </p>
//                                             <p className="text-xs text-gray-500 mt-1">
//                                                 {formatTime(msg.timestamp)}
//                                             </p>
//                                         </div>
//                                         <button
//                                             onClick={() => removeNotification(msg.id)}
//                                             className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
//                                         >
//                                             <X className="h-4 w-4 text-gray-400" />
//                                         </button>
//                                     </div>
//                                     {!msg.read && (
//                                         <div className="mt-2">
//                                             <span className="inline-block px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
//                                                 New
//                                             </span>
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// }
