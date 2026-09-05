import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import UserFormModal from '../components/UserFormModal'
import Spinner from '../components/Spinner'
import { getAllUsers, deactivateUser, activateUser } from '../api/userApi'
import { useToast } from '../context/ToastContext'

const ROLE_STYLES = {
  ADMIN: 'bg-primary-light text-primary',
  USER: 'bg-paper text-ink/60',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | null
  const [selectedUser, setSelectedUser] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()

  const loadUsers = useCallback(async () => {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      if (err.status === 403) {
        toast.error('Forbidden: Anda tidak memiliki akses untuk melihat daftar pengguna. Fitur ini khusus Admin.')
        navigate('/dashboard', { replace: true })
      } else {
        toast.error(err.message || 'Gagal memuat daftar pengguna.')
      }
    } finally {
      setLoading(false)
    }
  }, [toast, navigate])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phoneNumber?.toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  const handleToggleActive = async (user) => {
    setBusyId(user.id)
    try {
      if (user.active) {
        await deactivateUser(user.id)
        toast.success(`${user.fullName} dinonaktifkan.`)
      } else {
        await activateUser(user.id)
        toast.success(`${user.fullName} diaktifkan kembali.`)
      }
      loadUsers()
    } catch (err) {
      if (err.status === 403) {
        toast.error('Forbidden: Anda tidak memiliki akses untuk mengubah status pengguna. Fitur ini khusus Admin.')
      } else {
        toast.error(err.message || 'Gagal mengubah status pengguna.')
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-semibold">Kelola Pengguna</h1>
          <button
            type="button"
            onClick={() => {
              setModalMode('create')
              setSelectedUser(null)
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            + Tambah Pengguna
          </button>
        </div>

        <div className="mb-4 flex items-center rounded-lg border border-line bg-white px-3 focus-within:border-primary">
          <svg className="h-4 w-4 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, email, atau nomor HP..."
            className="w-full border-0 bg-transparent px-2 py-2.5 text-sm outline-none"
          />
        </div>

        {!loading && (
          <p className="mb-3 text-xs text-ink/50">
            Menampilkan {filteredUsers.length} dari {users.length} pengguna
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6 text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink/50">
              {searchTerm ? `Tidak ada pengguna yang cocok dengan "${searchTerm}".` : 'Belum ada pengguna.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink/50">
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/users/${u.id}`} className="font-medium text-primary hover:underline">
                        {u.fullName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-ink/70">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_STYLES[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.active ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                        }`}
                      >
                        {u.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setModalMode('edit')
                            setSelectedUser(u)
                          }}
                          className="rounded-md border border-line px-2.5 py-1 text-xs font-medium hover:bg-paper"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => handleToggleActive(u)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                            u.active
                              ? 'border-danger/30 text-danger hover:bg-danger-light'
                              : 'border-success/30 text-success hover:bg-success-light'
                          }`}
                        >
                          {busyId === u.id ? '...' : u.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <UserFormModal
        open={modalMode !== null}
        mode={modalMode}
        user={selectedUser}
        onClose={() => setModalMode(null)}
        onSuccess={loadUsers}
      />
    </div>
  )
}
