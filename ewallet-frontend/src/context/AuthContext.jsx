import { createContext, useCallback, useContext, useState } from 'react'
import { tokenStorage } from '../api/axiosInstance'
import { login as loginApi, register as registerApi } from '../api/authApi'

const AuthContext = createContext(null)

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

function normalizeRole(rawRole) {
  if (!rawRole) return null
  return rawRole.startsWith('ROLE_') ? rawRole.slice(5) : rawRole
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get())
  const [email, setEmail] = useState(() => {
    const existing = tokenStorage.get()
    return existing ? (decodeJwtPayload(existing)?.sub ?? null) : null
  })
  const [role, setRole] = useState(() => {
    const existing = tokenStorage.get()
    return existing ? normalizeRole(decodeJwtPayload(existing)?.role) : null
  })

  const login = useCallback(async (emailInput, password) => {
    const { token: newToken } = await loginApi(emailInput, password)
    const payload = decodeJwtPayload(newToken)
    const normalizedRole = normalizeRole(payload?.role)
    tokenStorage.set(newToken)
    setToken(newToken)
    setEmail(payload?.sub ?? emailInput)
    setRole(normalizedRole)
    return { role: normalizedRole }
  }, [])

  const register = useCallback(async (payload) => registerApi(payload), [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    setEmail(null)
    setRole(null)
  }, [])

  const value = {
    token,
    email,
    role,
    isAdmin: role === 'ADMIN',
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
