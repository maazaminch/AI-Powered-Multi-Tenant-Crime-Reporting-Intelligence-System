import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'


const ProtectedRoute = ({ children, requiredRole, allowedRoles, requiredFlags }) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role permissions
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check flag permissions
  if (requiredFlags) {
    for (const [flag, value] of Object.entries(requiredFlags)) {
      if (user?.[flag] !== value) {
        return <Navigate to="/unauthorized" replace />
      }
    }
  }

  return children
}

export default ProtectedRoute
