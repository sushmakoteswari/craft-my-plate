"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedRoute from "@/components/protected";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUsers = useCallback(async () => {
    if (!API_URL) {
      console.error("API URL is not defined");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/adminusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUsers(response.data.map((user: any) => ({
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role,
      })));
      toast.success("Users fetched successfully!");
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (id: string, updatedData: { name?: string; email?: string; role?: string }) => {
    try {
      if (!API_URL) throw new Error("API URL is not defined");
      const token = localStorage.getItem("token");
      
      const response = await axios.put(`${API_URL}/adminusers/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.map((user) => (user.id === id ? { ...user, ...response.data } : user)));
      setEditingUser(null);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      if (!API_URL) throw new Error("API URL is not defined");
      const token = localStorage.getItem("token");
      
      await axios.delete(`${API_URL}/adminusers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button onClick={() => setEditingUser(user)} variant="outline">Edit</Button>
                    <Button onClick={() => deleteUser(user.id)} variant="destructive" className="ml-2">Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center p-4">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit User</DialogTitle>
    </DialogHeader>
    {editingUser && (
      <>
        <Input
          type="text"
          placeholder="Name"
          value={editingUser.name}
          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
          className="mb-3"
          disabled
        />
        <Input
          type="email"
          placeholder="Email"
          value={editingUser.email}
          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
          className="mb-3"
        />
        <Select
          onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
          value={editingUser.role}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={() => setEditingUser(null)}>
            Cancel
          </Button>
          <Button variant="default" onClick={() => updateUser(editingUser.id, editingUser)}>
            Save Changes
          </Button>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>

    </div>
  </ProtectedRoute>
  );
};

export default UsersPage;
