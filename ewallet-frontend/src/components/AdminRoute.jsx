import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Client-side gate only for UX (hide/redirect away from admin screens).
// The real enforcement is server-side (@PreAuthorize("hasRole('ADMIN')")),
// so this never needs to be treated as a security boundary on its own.
export default function AdminRoute() {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
