import { useEffect, useState } from 'react'
import { getTransactionById } from '../api/transactionApi'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDateTime } from '../utils/formatCurrency'
import Spinner from './Spinner'

const STATUS_LABEL = { SUCCESS: 'Berhasil', PENDING: 'Diproses', FAILED: 'Gagal' }
const TYPE_LABEL = { DEPOSIT: 'Top Up', WITHDRAW: 'Tarik Saldo', TRANSFER: 'Transfer' }

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 text-sm last:border-0">
      <span className="text-ink/50">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default function TransactionDetailModal({ open, transactionId, onClose }) {
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (!open || !transactionId) return
    setLoading(true)
    getTransactionById(transactionId)
      .then(setTx)
      .catch((err) => {
        toast.error(err.message || 'Gagal memuat detail transaksi.')
        onClose()
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transactionId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Detail Transaksi</h2>
          <button type="button" onClick={onClose} className="text-ink/40 hover:text-ink" aria-label="Tutup">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-6 w-6 text-primary" />
          </div>
        ) : tx ? (
          <div className="mt-4">
            <Row label="ID" value={`#${tx.id}`} />
            <Row label="Jenis" value={TYPE_LABEL[tx.type] || tx.type} />
            <Row label="Nominal" value={formatCurrency(tx.amount)} />
            <Row label="Status" value={STATUS_LABEL[tx.status] || tx.status} />
            <Row label="Waktu" value={formatDateTime(tx.createdAt)} />
            <Row label="Order ID (Midtrans)" value={tx.orderId} />
            <Row label="Metode pembayaran" value={tx.paymentType} />
            <Row label="Wallet asal" value={tx.sourceWalletId ? `#${tx.sourceWalletId}` : null} />
            <Row label="Wallet tujuan" value={tx.destinationWalletId ? `#${tx.destinationWalletId}` : null} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
