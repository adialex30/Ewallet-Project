import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submitLock.current) return
    submitLock.current = true
    setErrors({})

    const nextErrors = {}
    if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Format email tidak valid.'
    if (!password) nextErrors.password = 'Password wajib diisi.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      submitLock.current = false
      return
    }

    setSubmitting(true)

    try {
      const { role } = await login(email, password)
      const defaultTarget = role === 'ADMIN' ? '/admin/users' : '/dashboard'
      const redirectTo = location.state?.from?.pathname || defaultTarget
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)
      } else if (err.status === 401) {
        toast.error('Email atau password salah.')
      } else {
        toast.error(err.message || 'Gagal masuk, silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Dompi</h1>
          <p className="mt-1 text-sm text-ink/60">Masuk untuk mengelola saldo Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                errors.email ? 'border-danger' : 'border-line focus:border-primary'
              }`}
              placeholder="nama@email.com"
            />
            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="text-sm font-medium text-ink/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                errors.password ? 'border-danger' : 'border-line focus:border-primary'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/60">
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
