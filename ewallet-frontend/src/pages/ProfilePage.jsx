import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import UserFormModal from '../components/UserFormModal'
import Spinner from '../components/Spinner'
import { getMyWallet } from '../api/walletApi'
import { getUserById } from '../api/userApi'
import { useToast } from '../context/ToastContext'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const wallet = await getMyWallet()
      const me = await getUserById(wallet.userId)
      setUser(me)
    } catch (err) {
      toast.error(err.message || 'Gagal memuat profil.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6 text-primary" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="mx-auto max-w-md px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="font-display text-xl font-semibold">Profil Saya</h1>

        <div className="mt-5 rounded-2xl border border-line bg-white p-6">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ink/50">Nama lengkap</dt>
              <dd className="mt-0.5 font-medium">{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Email</dt>
              <dd className="mt-0.5 font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Nomor HP</dt>
              <dd className="mt-0.5 font-medium">{user.phoneNumber || '-'}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Role</dt>
              <dd className="mt-0.5 font-medium">{user.role}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Edit Profil
          </button>
        </div>
      </main>

      <UserFormModal
        open={editOpen}
        mode="edit"
        user={user}
        onClose={() => setEditOpen(false)}
        onSuccess={load}
      />
    </div>
  )
}
