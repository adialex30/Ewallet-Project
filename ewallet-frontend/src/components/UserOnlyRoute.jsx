import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserOnlyRoute() {
  const { isAdmin } = useAuth()

  if (isAdmin) {
    return <Navigate to="/admin/users" replace />
  }

  return <Outlet />
}
