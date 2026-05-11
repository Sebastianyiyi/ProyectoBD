import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { InteractionStatus } from '@azure/msal-browser'

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useIsAuthenticated()
  const { inProgress } = useMsal()

  if (inProgress !== InteractionStatus.None) {
    return null // o un spinner
  }

  if (token || isAuthenticated) {
    return <Outlet />
  }

  return <Navigate to="/login" replace />
}