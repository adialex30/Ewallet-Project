import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Mirrors AdminRoute: Dashboard/Profil are for regular USER accounts, not
// ADMIN (whose job here is user management, not a personal wallet screen).
// Client-side UX only - real enforcement stays server-side.
export default function UserOnlyRoute() {
  const { isAdmin } = useAuth()

  if (isAdmin) {
    return <Navigate to="/admin/users" replace />
  }

  return <Outlet />
}
