"use client";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Image from 'next/image';


type FormMode = "login" | "register";

interface FormData {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin" | "manager";
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<FormMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    role: "user"
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "register") {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }

      if (!formData.role) {
        newErrors.role = "Please select a role";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as "user" | "admin" | "manager"
    }));
  };

  const handleModeSwitch = (newMode: FormMode) => {
    setMode(newMode);
    setErrors({});
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "user"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) return;
    setIsLoading(true);
  
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiUrl) throw new Error("API base URL is missing. Check .env.local file.");
  
      const endpoint = mode === "login" ? "auth/login" : "auth/register";
      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      console.log("API Response:", data); // Keep only essential logs
  
      if (!response.ok) throw new Error(data.message || "Something went wrong!");
  
      toast.success(`${mode === "login" ? "Login" : "Registration"} Successful!`, {
        position: "top-right",
        autoClose: 3000,
      });
  
      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data?.user?.role || "user"); // Default role fallback
      } else {
        console.warn("No token received upon authentication!");
      }
  
      if (mode === "register") {
        setFormData({ username: "", email: "", password: "", role: "user" });
      }
  
      router.refresh();
  
      setTimeout(() => {
        const userRole = data?.user?.role;
        router.push(userRole === "admin" ? "/admin" : userRole === "manager" ? "/Manager" : "/Home");
      }, 2000);
  
    } catch (error: any) {
      console.error("Error:", error); // Keep error logging
      toast.error(error.message || "Something went wrong.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
    <ToastContainer /> {/* Add this at the root level */}
    <div className="min-h-screen md:min-h-[80vh] flex items-center justify-center bg-gray-100 p-6">
  <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-xl rounded-3xl overflow-hidden">
    
    {/* Welcome Section */}
    <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-r from-[#6318af] to-purple-600 text-white p-16 text-center">
  <h1 className="text-5xl font-bold mb-4 animate-fadeIn">
    Craft Your Perfect Plate 🍽️
  </h1>
  <p className="text-lg opacity-90 mb-6 max-w-md">
    Fresh ingredients, endless choices. Order now and satisfy your cravings!
  </p>
  <p className="text-sm opacity-85 max-w-lg">
    Experience a world of flavors with our carefully curated menu. Whether it&apos;s a quick bite 
    or a gourmet meal, we&apos;ve got something special just for you. 
  </p>
  <p className="text-sm opacity-85 mt-4 max-w-lg">
    Order in just a few clicks and have your favorite meals delivered hot and fresh right to your door.  
    Indulge in a delightful dining experience without leaving your comfort zone.
  </p>
  <button
    className="bg-white text-[#6318af] font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-200 transition text-lg mt-6"
    onClick={() => handleModeSwitch("register")}
  >
    Order Now 🚀
  </button>
</div>

    {/* Authentication Form - Right Section */}
    <div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <Image src="/logo_wbg.png" alt="Logo" width={100} height={100} />
      </div>
      
      <h2 className="text-3xl font-semibold text-[#6318af] text-center mb-4">
        {mode === "login" ? "Welcome Back" : "Create Account"}
      </h2>
      <p className="text-gray-600 text-center mb-6">
        {mode === "login"
          ? "Enter your credentials to access your account"
          : "Fill in your details to create a new account"}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <input
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
        </div>

        {mode === "register" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        {mode === "register" && (
  <div className="space-y-2">
    <label className="text-sm font-medium">Role</label>
    <select
      name="role"
      value={formData.role}
      onChange={(e) => handleRoleChange(e.target.value)}
      className="border border-gray-300 rounded-lg p-2 w-full"
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
      <option value="manager">Manager</option>
    </select>
    {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
  </div>
)}


        <button 
          type="submit" 
          className="w-full bg-[#6318af] text-white py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition"
        >
          {mode === "login" ? "Sign In" : "Sign Up"}
        </button>

        <div className="text-center text-sm">
          {mode === "login" ? (
            <p className="text-gray-500">
              Don&apos;t have an account? 
              <button
                className="text-[#6318af] font-semibold ml-1"
                type="button"
                onClick={() => handleModeSwitch("register")}
              >
                Register here
              </button>
            </p>
          ) : (
            <p className="text-gray-500">
              Already have an account? 
              <button
                className="text-[#6318af] font-semibold ml-1"
                type="button"
                onClick={() => handleModeSwitch("login")}>
                Login here
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  </div>
</div>
</>
);
}

