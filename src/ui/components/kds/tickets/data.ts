
import {type  Ticket } from "./ticket.types";

export const mockTickets: Ticket[] = [
  {
    id: "1",
    orderNumber: "12326",
    restaurant: "Restaurant",
    adminId: "22358",
    receivedTime: new Date(Date.now() - 2 * 60000),
    preparationTime: "02:26",
    tableNumber: "178",
    items: [
      { id: "1-1", name: "Mongolian Beef", quantity: 1, status: "completed", notes: "" },
      { id: "1-2", name: "Chicken Chow Mein", quantity: 1, status: "completed", notes: "" },
      { id: "1-3", name: "Wonton Soup", quantity: 1, status: "pending", notes: "Beef and chicken" },
      { id: "1-4", name: "Spring Rolls", quantity: 1, status: "pending", notes: "No salt" }
    ]
  },
  {
    id: "2",
    orderNumber: "12327",
    restaurant: "Restaurant",
    adminId: "22358",
    receivedTime: new Date(Date.now() - 1 * 60000),
    preparationTime: "01:27",
    tableNumber: "178",
    items: [
      { id: "2-1", name: "Mongolian Beef", quantity: 1, status: "completed", notes: "" },
      { id: "2-2", name: "Chicken Chow Mein", quantity: 1, status: "pending", notes: "" },
      { id: "2-3", name: "Wonton Soup", quantity: 1, status: "pending", notes: "Beef and chicken" }
    ]
  },
  {
    id: "3",
    orderNumber: "12328",
    restaurant: "Restaurant",
    adminId: "22358",
    receivedTime: new Date(Date.now() - 2.5 * 60000),
    preparationTime: "02:22",
    tableNumber: "178",
    items: [
      { id: "3-1", name: "Mongolian Beef", quantity: 1, status: "pending", notes: "" },
      { id: "3-2", name: "Chicken Chow Mein", quantity: 1, status: "pending", notes: "" },
      { id: "3-3", name: "Wonton Soup", quantity: 1, status: "pending", notes: "Beef and chicken" },
      { id: "3-4", name: "Spring Rolls", quantity: 1, status: "completed", notes: "No salt" },
      { id: "3-5", name: "Chicken Chow Mein", quantity: 1, status: "pending", notes: "" }
    ]
  },
  {
    id: "4",
    orderNumber: "12329",
    restaurant: "Restaurant",
    adminId: "22358",
    receivedTime: new Date(Date.now() - 0.6 * 60000),
    preparationTime: "00:36",
    tableNumber: "178",
    items: [
      { id: "4-1", name: "Mongolian Beef", quantity: 1, status: "completed", notes: "" },
      { id: "4-2", name: "Chicken Chow Mein", quantity: 1, status: "completed", notes: "" },
      { id: "4-3", name: "Wonton Soup", quantity: 1, status: "pending", notes: "Beef and chicken" },
      { id: "4-4", name: "Spring Rolls", quantity: 1, status: "completed", notes: "" }
    ]
  }
];
