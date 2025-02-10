'use client'
import React, { useState, useEffect } from "react";
import axios, { AxiosResponse, AxiosError } from "axios";
import AdminLayout from "../page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "@/components/protected";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface MenuItem {
  _id: string;
  name: string;
  price: string;
  category: string;
  availability: boolean;
}

interface ApiError {
  message: string;
}

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<MenuItem, "_id">>({
    name: "",
    price: "",
    category: "",
    availability: true,
  });

  const getAuthToken = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }
    return token.replace(/['"]+/g, ''); // Remove any quotes
  };

  const createAxiosConfig = () => {
    const token = getAuthToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const handleApiError = (error: AxiosError<ApiError>) => {
    console.error("API Error:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
      return "Session expired. Please login again.";
    }
    
    if (error.response?.status === 403) {
      return "You don't have permission to perform this action.";
    }
    
    return error.response?.data?.message || "An unexpected error occurred";
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get<MenuItem[]>(
        `${API_URL}/menu`,
        createAxiosConfig()
      );
      setMenuItems(response.data);
    } catch (err) {
      const errorMessage = handleApiError(err as AxiosError<ApiError>);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const addMenuItem = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post<MenuItem>(
        `${API_URL}/menu`,
        newItem,
        createAxiosConfig()
      );
      setMenuItems([...menuItems, response.data]);
      setNewItem({ name: "", price: "", category: "", availability: true });
    } catch (err) {
      const errorMessage = handleApiError(err as AxiosError<ApiError>);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async () => {
    if (!editingItem) return;

    try {
      setLoading(true);
      setError("");
      const response = await axios.put<MenuItem>(
        `${API_URL}/menu/${editingItem._id}`,
        {
          name: editingItem.name,
          price: editingItem.price,
          category: editingItem.category,
          availability: editingItem.availability
        },
        createAxiosConfig()
      );
      
      setMenuItems(menuItems.map((item) => 
        item._id === editingItem._id ? response.data : item
      ));
      setEditingItem(null);
    } catch (err) {
      const errorMessage = handleApiError(err as AxiosError<ApiError>);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (_id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.delete(
        `${API_URL}/menu/${_id}`,
        createAxiosConfig()
      );
      setMenuItems(menuItems.filter((item) => item._id !== _id));
    } catch (err) {
      const errorMessage = handleApiError(err as AxiosError<ApiError>);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleAddNewItem = async () => {
    await addMenuItem();
    setIsAddDialogOpen(false);
  };

  const resetNewItem = () => {
    setNewItem({
      name: "",
      price: "",
      category: "",
      availability: true,
    });
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
    <div className="p-6" >
      <Card>
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-4">
  <CardTitle className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
    Manage Menu
  </CardTitle>
  <Button
    onClick={() => setIsAddDialogOpen(true)}
    className="text-sm sm:text-xl px-3 sm:px-5 py-3 sm:py-5 w-full sm:w-auto"
  >
    <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Add Item
  </Button>
</CardHeader>


        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow className="text-lg">
                <TableHead >Item Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=" text-base">
              {menuItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={item.availability}
                      disabled
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingItem(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteMenuItem(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetNewItem();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="availability"
                checked={newItem.availability}
                onCheckedChange={(checked) => 
                  setNewItem({ ...newItem, availability: checked })
                }
              />
              <Label htmlFor="availability">Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={!!editingItem} 
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-availability"
                    checked={editingItem.availability}
                    onCheckedChange={(checked) => 
                      setEditingItem({ ...editingItem, availability: checked })
                    }
                  />
                  <Label htmlFor="edit-availability">Available</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={updateMenuItem}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  </ProtectedRoute>
);
};

export default MenuPage;