import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  const { register, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submitLock.current) return
    submitLock.current = true
    setErrors({})
    setSubmitting(true)

    try {
      await register(form)
      toast.success('Akun berhasil dibuat. Silakan masuk.')
      await login(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)
      } else if (err.status === 400) {
        toast.error(err.message || 'Email sudah terdaftar.')
      } else {
        toast.error(err.message || 'Gagal mendaftar, silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  const fields = [
    { key: 'fullName', label: 'Nama lengkap', type: 'text', autoComplete: 'name' },
    { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { key: 'phoneNumber', label: 'Nomor HP (opsional)', type: 'text', autoComplete: 'tel' },
    { key: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Buat akun Dompi</h1>
          <p className="mt-1 text-sm text-ink/60">Minimal 8 karakter untuk password</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6">
          {fields.map(({ key, label, type, autoComplete }) => (
            <div key={key} className={key !== 'fullName' ? 'mt-4' : ''}>
              <label htmlFor={key} className="text-sm font-medium text-ink/70">
                {label}
              </label>
              <input
                id={key}
                type={type}
                autoComplete={autoComplete}
                value={form[key]}
                onChange={update(key)}
                disabled={submitting}
                className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                  errors[key] ? 'border-danger' : 'border-line focus:border-primary'
                }`}
              />
              {errors[key] && <p className="mt-1 text-sm text-danger">{errors[key]}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/60">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
