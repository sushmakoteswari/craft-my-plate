"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type React from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setIsAuthorized(false)
      router.push("/")
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    fetch(`${apiUrl}/authRoute/protected`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message !== "Access granted" || !data.user?.role) {
          localStorage.removeItem("token")
          localStorage.removeItem("role")
          setIsAuthorized(false)
          router.push("/")
          return
        }
        const userRole = data.user.role as string
        localStorage.setItem("role", userRole)
        setIsAuthorized(allowedRoles.includes(userRole))
      })
      .catch(() => {
        setIsAuthorized(false)
        router.push("/")
      })
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
