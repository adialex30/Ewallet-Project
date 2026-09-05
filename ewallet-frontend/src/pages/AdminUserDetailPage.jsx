import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TransactionTable from '../components/TransactionTable'
import TransactionDetailModal from '../components/TransactionDetailModal'
import UserFormModal from '../components/UserFormModal'
import Spinner from '../components/Spinner'
import { getUserById, deactivateUser, activateUser } from '../api/userApi'
import { getWalletById, getWalletTransactions } from '../api/walletApi'
import { formatCurrency } from '../utils/formatCurrency'
import { useToast } from '../context/ToastContext'

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedTxId, setSelectedTxId] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const userData = await getUserById(id)
      setUser(userData)

      if (userData.walletId) {
        const [walletData, txData] = await Promise.all([
          getWalletById(userData.walletId),
          getWalletTransactions(userData.walletId),
        ])
        setWallet(walletData)
        setTransactions(txData)
      }
    } catch (err) {
      if (err.status === 403) {
        toast.error('Forbidden: Anda tidak memiliki akses untuk melihat data pengguna ini.')
        navigate('/admin/users', { replace: true })
      } else {
        toast.error(err.message || 'Gagal memuat data pengguna.')
      }
    } finally {
      setLoading(false)
    }
  }, [id, toast, navigate])

  useEffect(() => {
    load()
  }, [load])

  const handleToggleActive = async () => {
    setBusy(true)
    try {
      if (user.active) {
        await deactivateUser(user.id)
        toast.success('Pengguna dinonaktifkan.')
      } else {
        await activateUser(user.id)
        toast.success('Pengguna diaktifkan kembali.')
      }
      load()
    } catch (err) {
      if (err.status === 403) {
        toast.error('Forbidden: Anda tidak memiliki akses untuk mengubah status pengguna. Fitur ini khusus Admin.')
      } else {
        toast.error(err.message || 'Gagal mengubah status pengguna.')
      }
    } finally {
      setBusy(false)
    }
  }

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

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Link to="/admin/users" className="text-sm text-primary hover:underline">
          ← Kembali ke Kelola Pengguna
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-lg font-semibold">{user.fullName}</h1>
                  <p className="text-sm text-ink/60">{user.email}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    user.active ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                  }`}
                >
                  {user.active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between border-t border-line pt-2">
                  <dt className="text-ink/50">Nomor HP</dt>
                  <dd className="font-medium">{user.phoneNumber || '-'}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2">
                  <dt className="text-ink/50">Role</dt>
                  <dd className="font-medium">{user.role}</dd>
                </div>
              </dl>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="flex-1 rounded-lg border border-line py-2 text-sm font-medium hover:bg-paper"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleToggleActive}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium disabled:opacity-50 ${
                    user.active
                      ? 'border-danger/30 text-danger hover:bg-danger-light'
                      : 'border-success/30 text-success hover:bg-success-light'
                  }`}
                >
                  {user.active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </div>

            {wallet && (
              <div className="rounded-2xl bg-ink p-6 text-white">
                <span className="text-sm text-white/60">Saldo wallet</span>
                <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
                  {formatCurrency(wallet.balance)}
                </p>
                <p className="mt-1 text-xs text-white/40">Wallet #{wallet.id}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <h2 className="mb-3 font-display text-base font-semibold">Riwayat Transaksi</h2>
            <TransactionTable
              transactions={transactions}
              myWalletId={wallet?.id}
              loading={false}
              onRowClick={setSelectedTxId}
            />
          </div>
        </div>
      </main>

      <UserFormModal
        open={editOpen}
        mode="edit"
        user={user}
        onClose={() => setEditOpen(false)}
        onSuccess={load}
      />

      <TransactionDetailModal
        open={Boolean(selectedTxId)}
        transactionId={selectedTxId}
        onClose={() => setSelectedTxId(null)}
      />
    </div>
  )
}
