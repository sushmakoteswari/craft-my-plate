"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "@/components/protected";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  date: string;
  status: string; // Added status field
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function OrderPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "{}"));

    // Fetch Menu Items
    fetch(`${API_URL}/menu/`)
      .then((res) => res.json())
      .then((data) => setMenuData(data))
      .catch((error) => console.error("Error fetching menu:", error));

    // Fetch User Orders
    fetch(`${API_URL}/orders/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Orders:", data);
        setOrders(data);
      })
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);
  
return (
  <ProtectedRoute allowedRoles={["user"]}>
  <ToastContainer />

   <Card className="p-4 shadow-lg rounded-xl border border-gray-200 bg-white">
{/* Order History */}
<CardHeader className="text-2xl font-bold mt-6 text-gray-800">Order History</CardHeader>
<CardContent>
  {orders.length === 0 ? (
    <p className="text-gray-500 text-center">No previous orders.</p>
  ) : (
    <ul className="space-y-4">
    {orders.map((order) => (
      <li
        key={order._id}
        className="relative p-5 bg-white shadow-lg rounded-2xl border border-gray-200 transition-transform hover:scale-[1.02]"
      >
        {/* Order Status Badge */}
        <p
          className={clsx(
            "font-medium text-xs px-3 py-1 rounded-full w-fit shadow-sm",
            {
              "bg-yellow-100 text-yellow-700": order.status === "Pending",
              "bg-green-100 text-green-700": order.status === "Completed",
            }
          )}
        >
          {order.status}
        </p>

        {/* Order Items */}
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name} <span className="text-gray-500">x{item.qty}</span>
              </span>
              <span className="font-medium">₹{item.price * item.qty}</span>
            </li>
            
          ))}
        </ul>

        {/* Order Details */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-gray-500">📅 {order.date}</p>
          <p className="font-bold text-gray-800 text-lg">Total: ₹{order.totalAmount}</p>
        </div>
      </li>
    ))}
  </ul>

  )}
</CardContent>
</Card>
</ProtectedRoute>
);
}