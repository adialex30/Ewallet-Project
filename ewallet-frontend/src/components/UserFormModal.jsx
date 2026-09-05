import { useEffect, useRef, useState } from 'react'
import { createUser, updateUser } from '../api/userApi'
import { useToast } from '../context/ToastContext'
import Spinner from './Spinner'

const EMPTY_FORM = { fullName: '', email: '', phoneNumber: '', password: '', role: 'USER' }

export default function UserFormModal({ open, mode, user, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)
  const toast = useToast()

  useEffect(() => {
    if (mode === 'edit' && user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        role: user.role || 'USER',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [mode, user, open])

  if (!open) return null

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitLock.current) return
    submitLock.current = true
    setErrors({})
    setSubmitting(true)

    try {
      if (mode === 'create') {
        await createUser(form)
        toast.success('Pengguna baru berhasil dibuat.')
      } else {
        await updateUser(user.id, {
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password.trim() === '' ? null : form.password,
        })
        toast.success('Perubahan berhasil disimpan.')
      }
      onSuccess()
      onClose()
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)
      } else if (err.status === 403) {
        toast.error('Forbidden: Anda tidak memiliki akses untuk melakukan aksi ini. Fitur ini khusus Admin.')
      } else {
        toast.error(err.message || 'Gagal menyimpan data pengguna.')
      }
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {mode === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna'}
          </h2>
          <button type="button" onClick={onClose} className="text-ink/40 hover:text-ink" aria-label="Tutup">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink/70">Nama lengkap</label>
            <input
              type="text"
              value={form.fullName}
              onChange={update('fullName')}
              disabled={submitting}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                errors.fullName ? 'border-danger' : 'border-line focus:border-primary'
              }`}
            />
            {errors.fullName && <p className="mt-1 text-sm text-danger">{errors.fullName}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-ink/70">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              disabled={submitting}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                errors.email ? 'border-danger' : 'border-line focus:border-primary'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-ink/70">Nomor HP (opsional)</label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={update('phoneNumber')}
              disabled={submitting}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                errors.phoneNumber ? 'border-danger' : 'border-line focus:border-primary'
              }`}
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-danger">{errors.phoneNumber}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-ink/70">
              {mode === 'create' ? 'Password' : 'Password baru (opsional)'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              disabled={submitting}
              placeholder={mode === 'edit' ? 'Kosongkan jika tidak diubah' : ''}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
                errors.password ? 'border-danger' : 'border-line focus:border-primary'
              }`}
            />
            {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
          </div>

          {mode === 'create' && (
            <div>
              <label className="text-sm font-medium text-ink/70">Role</label>
              <select
                value={form.role}
                onChange={update('role')}
                disabled={submitting}
                className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  )
}
