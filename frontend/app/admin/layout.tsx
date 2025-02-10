"use client";

import Layout from "../../components/nav";
import Sidebar from "../../components/admin/sidebar";
import { ReactNode, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return <Layout>  <div className="flex">
  {/* Sidebar with state management */}
  <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

  {/* Main Content (adjust margin for mobile) */}
  <main
    className={`p-6 w-full transition-all ${
      isSidebarOpen ? "ml-64" : "ml-0 md:ml-64"
    }`}
  >
    {children}
  </main>
</div></Layout>;
}
