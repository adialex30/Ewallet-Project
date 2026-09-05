import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import TransactionTable from '../components/TransactionTable'
import AdminTransactionTable from '../components/AdminTransactionTable'
import TransactionDetailModal from '../components/TransactionDetailModal'
import { getMyWallet } from '../api/walletApi'
import { getMyTransactions, getAllTransactions } from '../api/transactionApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function TransactionsPage() {
  const { isAdmin } = useAuth()

  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTxId, setSelectedTxId] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (isAdmin) {
      getAllTransactions()
        .then(setTransactions)
        .catch((err) => toast.error(err.message || 'Gagal memuat aktivitas transaksi.'))
        .finally(() => setLoading(false))
      return
    }

    Promise.all([getMyWallet(), getMyTransactions()])
      .then(([walletData, txData]) => {
        setWallet(walletData)
        setTransactions(txData)
      })
      .catch((err) => toast.error(err.message || 'Gagal memuat riwayat transaksi.'))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const filteredTransactions = useMemo(() => {
    if (!isAdmin) return transactions
    const term = searchTerm.trim().toLowerCase()
    if (!term) return transactions
    return transactions.filter(
      (tx) =>
        tx.sourceUserFullName?.toLowerCase().includes(term) ||
        tx.sourceUserEmail?.toLowerCase().includes(term) ||
        tx.destinationUserFullName?.toLowerCase().includes(term) ||
        tx.destinationUserEmail?.toLowerCase().includes(term)
    )
  }, [isAdmin, transactions, searchTerm])

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
          <h1 className="font-display text-xl font-semibold">
            {isAdmin ? 'Aktivitas Transaksi Pengguna' : 'Riwayat Transaksi'}
          </h1>
        </div>

        {isAdmin && (
          <div className="mb-4 flex items-center rounded-lg border border-line bg-white px-3 focus-within:border-primary">
            <svg className="h-4 w-4 text-ink/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau email pengguna..."
              className="w-full border-0 bg-transparent px-2 py-2.5 text-sm outline-none"
            />
          </div>
        )}

        {isAdmin ? (
          <AdminTransactionTable
            transactions={filteredTransactions}
            loading={loading}
            onRowClick={setSelectedTxId}
          />
        ) : (
          <TransactionTable
            transactions={filteredTransactions}
            myWalletId={wallet?.id}
            loading={loading}
            onRowClick={setSelectedTxId}
          />
        )}
      </main>

      <TransactionDetailModal
        open={Boolean(selectedTxId)}
        transactionId={selectedTxId}
        onClose={() => setSelectedTxId(null)}
      />
    </div>
  )
}
