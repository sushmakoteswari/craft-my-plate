"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected";

interface User {
  username: string;
  email: string;
  role: "user" | "admin" | "manager";
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  availability: boolean;
}

const themeColor = "#6318af";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_URL}/menu/`)
      .then((res) => res.json())
      .then((data) => setMenuData(data))
      .catch(() => console.error("Failed to fetch menu"));
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/");
    } else {
      fetch(`${API_URL}/authRoute/protected`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Access granted") {
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
            router.push("/");
          }
        })
        .catch(() => console.error("Auth check failed"));
    }
  }, [router]);

 

  const handleAddToCart = (id: string) => {
    setCart((prev) => {
      const newCart = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };
  
  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1;
      else delete newCart[id];
      
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };
  

  const navigateToOrderHistory = () => router.push("/Home/OrderHistory");
  const navigateToOrders = () => router.push("/Home/Orders");


  const categories = Array.from(new Set(menuData.map((item) => item.category)));

  const filteredMenu = menuData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <ProtectedRoute allowedRoles={["user"]}>
    <div className="min-h-screen bg-gray-100">

      <main className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-end items-end gap-4 mt-4">
  <input
    type="text"
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="p-2 border rounded-md text-sm w-full sm:w-auto"
  />
 
  <Button style={{ backgroundColor: themeColor }} onClick={navigateToOrderHistory}>
    Order History
  </Button>
</div>

        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h2 className="text-xl sm:text-lg font-bold text-gray-800 mb-3">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMenu.filter((item) => item.category === category).map((item) => (
                <Card key={item._id} className="shadow-md">
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mt-2">₹{item.price}</p>
                    <div className="flex justify-between items-center mt-3">
                      {cart[item._id] ? (
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleRemoveFromCart(item._id)}>-</Button>
                          <span className="text-lg sm:text-sm font-semibold">{cart[item._id]}</span>
                          <Button onClick={() => handleAddToCart(item._id)}>+</Button>
                        </div>
                      ) : (
                        <Button style={{ backgroundColor: themeColor }} onClick={() => handleAddToCart(item._id)}>
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </main>

      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 flex justify-between items-center">
          <p className="text-lg sm:text-sm font-bold">
            Total: ₹
            {Object.entries(cart).reduce(
              (acc, [id, qty]) => acc + (menuData.find((item) => item._id === id)?.price || 0) * qty,
              0
            )}
          </p>
          <Button style={{ backgroundColor: themeColor }} onClick={navigateToOrders}>
  CheckOut
</Button>


        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
