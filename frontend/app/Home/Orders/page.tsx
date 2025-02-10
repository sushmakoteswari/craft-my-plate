"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Use next/navigation instead of next/router
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToastContainer, toast } from "react-toastify";
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
  const router = useRouter(); // ✅ Correctly using useRouter from next/navigation

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

  const handleIncreaseQuantity = (id: string) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart, [id]: (prevCart[id] || 0) + 1 };
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleDecreaseQuantity = (id: string) => {
    setCart((prevCart) => {
      if (prevCart[id] > 1) {
        const updatedCart = { ...prevCart, [id]: prevCart[id] - 1 };
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        return updatedCart;
      }
      return prevCart;
    });
  };

  const totalAmount = Object.entries(cart).reduce(
    (acc, [id, qty]) => acc + (menuData.find((item) => item._id === id)?.price || 0) * qty,
    0
  );

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to place an order.");
      return;
    }

    const orderItems = Object.entries(cart).map(([id, quantity]) => ({
      menuItem: id,
      quantity,
    }));

    try {
      const response = await fetch(`${API_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: orderItems }),
      });

      if (response.ok) {
        toast.success("Order Placed Successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        setCart({}); // ✅ Clear cart
        localStorage.removeItem("cart"); // ✅ Remove cart from localStorage

        // ✅ Navigate to Order History Page after 1s delay for better UX
        setTimeout(() => {
          router.push("/Home/OrderHistory");
        }, 1000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred while placing the order.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <ToastContainer />
      
      <Card className="p-4 shadow-lg rounded-xl border border-gray-200 bg-white">
        <CardHeader className="text-2xl font-bold text-gray-800">Review Your Order</CardHeader>
        <CardContent>
          {Object.keys(cart).length === 0 ? (
            <p className="text-gray-500 text-center">No items in the cart.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(cart).map(([id, qty]) => {
                const item = menuData.find((menuItem) => menuItem._id === id);
                if (!item) return null;
                return (
                  <li key={id} className="flex justify-between items-center py-4 border-b border-gray-300">
                    {/* Left: Item Name & Price */}
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg text-gray-900">{item.name}</span>
                      <span className="text-sm text-gray-500">₹{item.price * qty}</span>
                    </div>

                    {/* Right: Quantity Selector */}
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full shadow-md">
                      <button
                        className="w-7 h-7 flex items-center justify-center bg-white text-puple-400 font-bold text-lg rounded-full shadow"
                        onClick={() => handleDecreaseQuantity(id)}
                        disabled={qty === 1} // ✅ Prevent reducing quantity below 1
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-semibold text-gray-800">{qty}</span>
                      <button
                        className="w-7 h-7 flex items-center justify-center bg-purple-500 text-white font-bold text-lg rounded-full shadow"
                        onClick={() => handleIncreaseQuantity(id)}
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Separator className="my-4" />
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-gray-800">Total: ₹{totalAmount}</p>
            <Button onClick={handlePlaceOrder} disabled={totalAmount === 0}>
              Place Order
            </Button>
          </div>
        </CardContent>
      </Card>
   </ProtectedRoute>
  );
}
