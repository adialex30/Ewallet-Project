import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import BalanceCard from '../components/BalanceCard'
import TransferForm from '../components/TransferForm'
import TransactionTable from '../components/TransactionTable'
import TopUpModal from '../components/TopUpModal'
import TransactionDetailModal from '../components/TransactionDetailModal'
import { getMyWallet } from '../api/walletApi'
import { getMyTransactions } from '../api/transactionApi'
import { useToast } from '../context/ToastContext'

export default function DashboardPage() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [refreshingWallet, setRefreshingWallet] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [selectedTxId, setSelectedTxId] = useState(null)
  const toast = useToast()

  const loadWallet = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshingWallet(true)
    try {
      const data = await getMyWallet()
      setWallet(data)
    } catch (err) {
      toast.error(err.message || 'Gagal memuat saldo.')
    } finally {
      setLoadingWallet(false)
      setRefreshingWallet(false)
    }
  }, [toast])

  const loadTransactions = useCallback(async () => {
    try {
      const data = await getMyTransactions()
      setTransactions(data)
    } catch (err) {
      toast.error(err.message || 'Gagal memuat riwayat transaksi.')
    } finally {
      setLoadingTransactions(false)
    }
  }, [toast])

  useEffect(() => {
    loadWallet()
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshAll = () => {
    loadWallet({ silent: true })
    loadTransactions()
  }

  const handleTopUpSuccess = () => {
    refreshAll()
    // The wallet is only actually credited once the Midtrans webhook lands
    // on the backend, which can be a moment behind the Snap popup closing -
    // poll once more shortly after so the balance catches up without the
    // user having to hit refresh themselves.
    setTimeout(refreshAll, 4000)
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <BalanceCard
              balance={wallet?.balance}
              loading={loadingWallet}
              refreshing={refreshingWallet}
              onTopUp={() => setTopUpOpen(true)}
              onRefresh={() => loadWallet({ silent: true })}
            />
            <TransferForm onSuccess={refreshAll} />
          </div>

          <div className="lg:col-span-7">
            <h2 className="mb-3 font-display text-base font-semibold">Riwayat Transaksi</h2>
            <TransactionTable
              transactions={transactions}
              myWalletId={wallet?.id}
              loading={loadingTransactions}
              onRowClick={setSelectedTxId}
            />
          </div>
        </div>
      </main>

      <TopUpModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={handleTopUpSuccess}
      />

      <TransactionDetailModal
        open={Boolean(selectedTxId)}
        transactionId={selectedTxId}
        onClose={() => setSelectedTxId(null)}
      />
    </div>
  )
}
