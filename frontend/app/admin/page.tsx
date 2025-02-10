"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "./layout";
import { useState } from "react";
import ProtectedRoute from "@/components/protected";

const AdminDashboard = () => {
  const [stats] = useState([
    { title: "Total Orders", value: "1,245" },
    { title: "Total Users", value: "520" },
    { title: "Revenue", value: "$24,000" },
    { title: "Pending Orders", value: "15" },
  ]);

  const [recentOrders] = useState([
    { id: "#1001", user: "John Doe", status: "Completed", amount: "$120" },
    { id: "#1002", user: "Jane Smith", status: "Pending", amount: "$85" },
    { id: "#1003", user: "David Wilson", status: "Processing", amount: "$45" },
  ]);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>

    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-md">
            <CardHeader>
              <CardTitle>{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="bg-white p-4 shadow-md rounded-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{order.id}</td>
                  <td className="p-2">{order.user}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        order.status === "Completed"
                          ? "bg-green-500 text-white"
                          : order.status === "Pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-2">{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      </ProtectedRoute>
  );
};

export default AdminDashboard;
