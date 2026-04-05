"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div style={{color: "black"}}>Loading...</div>
  }

  if (!currentUser) {
    return <Navigate to="/login.html" />
  }

  return children
}

export default ProtectedRoute

