"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ProtectedRoute from "@/components/protected";

interface Order {
  _id: string;
  customer: string;
  totalAmount: number;
  status: string;
}
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/allorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders', error);
    }
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowPopup(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/orders/${selectedOrder._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      setShowPopup(false);
      toast.success("Order Status Updated Successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to update order status!", {
        position: "top-right",
        autoClose: 3000,
      });
  };
  }
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ToastContainer />
      <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>{order.totalAmount} /-</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEditClick(order)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No orders found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order Status</DialogTitle>
          </DialogHeader>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={handleUpdateStatus}>Update</Button>
            <Button variant="outline" onClick={() => setShowPopup(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default OrdersPage;
