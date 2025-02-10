"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


const themeColor = "#6318af";


export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authRoute/protected`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Access granted") {
            setUser({ username: data.user.username, role: data.user.role });
            localStorage.setItem("role", data.user.role);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/");
          }
        })
        .catch(() => console.error("Auth check failed"));
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="border-b bg-white p-4 flex justify-between items-center">
        <h1 className=" text-sm sm:text-sm font-bold text-gray-800">
          Welcome, {user?.username || "Guest"}! ({user?.role || "No Role"})
        </h1>
        <div className="flex items-center gap-4">
          <Button
            style={{ backgroundColor: themeColor }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              router.push("/");
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
