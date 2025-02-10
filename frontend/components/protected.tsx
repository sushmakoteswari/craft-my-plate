"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type React from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null) // null represents loading state
  const router = useRouter()
  const [authUpdated, setAuthUpdated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userRole = localStorage.getItem("role")
    console.log("Checking auth state:", { token, userRole });
    
    if (!token || !userRole) {
      router.push("/")
      return
    }

    setIsAuthorized(allowedRoles.includes(userRole));
    setAuthUpdated((prev) => !prev);

  }, [router, allowedRoles])

  if (isAuthorized === null) {
    return <div className="text-center text-gray-500">Checking permissions...</div>
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-xl font-bold">
        Permission Denied
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
