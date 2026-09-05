import { createContext, useCallback, useContext, useState } from 'react'
import { tokenStorage } from '../api/axiosInstance'
import { login as loginApi, register as registerApi } from '../api/authApi'

const AuthContext = createContext(null)

// Reads the JWT payload for DISPLAY purposes only (e.g. showing the logged
// in email in the navbar). This is not a trust boundary - every request is
// still re-validated server-side by JwtAuthenticationFilter using the
// signature, so nothing security-relevant depends on this decode.
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

// The backend puts the Spring Security authority string in the "role" claim
// (CustomUserDetailsService: .authorities("ROLE_" + user.getRole().name())),
// so the JWT actually carries "ROLE_ADMIN" / "ROLE_USER", not "ADMIN"/"USER".
// Strip the prefix here so the rest of the app can just check role === 'ADMIN'.
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
    // Returned directly (not just set into state) so callers like LoginPage
    // can redirect based on role right away, without waiting on a re-render.
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
