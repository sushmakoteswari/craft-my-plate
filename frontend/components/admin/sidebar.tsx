"use client";
import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Users", path: "/admin/users" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Menu", path: "/admin/menu" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-3 fixed top-4 left-4 z-50 bg-gray-900 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white p-4 transition-transform z-50 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                href={item.path}
                className={`block p-2 rounded ${
                  pathname === item.path ? "bg-blue-500" : "hover:bg-gray-700"
                }`}
                onClick={() => setTimeout(() => setIsOpen(false), 150)} // Delay closing sidebar for smooth navigation
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay for mobile (click to close sidebar) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
