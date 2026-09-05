import { formatCurrency, formatDateTime } from '../utils/formatCurrency'

const STATUS_STYLES = {
  SUCCESS: 'bg-success-light text-success',
  PENDING: 'bg-pending-light text-pending',
  FAILED: 'bg-danger-light text-danger',
}

const STATUS_LABEL = {
  SUCCESS: 'Berhasil',
  PENDING: 'Diproses',
  FAILED: 'Gagal',
}

const TYPE_LABEL = {
  DEPOSIT: 'Top Up',
  WITHDRAW: 'Tarik Saldo',
  TRANSFER: 'Transfer',
}

function describeActor(tx) {
  if (tx.type === 'TRANSFER') {
    const from = tx.sourceUserFullName || `Wallet #${tx.sourceWalletId}`
    const to = tx.destinationUserFullName || `Wallet #${tx.destinationWalletId}`
    return `${from} → ${to}`
  }
  if (tx.type === 'WITHDRAW') {
    return tx.sourceUserFullName || `Wallet #${tx.sourceWalletId}`
  }

  return tx.destinationUserFullName || `Wallet #${tx.destinationWalletId}`
}

export default function AdminTransactionTable({ transactions, loading, onRowClick }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-paper" />
          ))}
        </div>
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <p className="font-display text-base font-semibold">Belum ada aktivitas transaksi</p>
        <p className="mt-1 text-sm text-ink/60">Aktivitas dari semua pengguna akan muncul di sini.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink/50">
              <th className="px-5 py-3 font-medium">Tanggal</th>
              <th className="px-5 py-3 font-medium">Pengguna</th>
              <th className="px-5 py-3 font-medium">Jenis</th>
              <th className="px-5 py-3 font-medium text-right">Nominal</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                onClick={() => onRowClick?.(tx.id)}
                className={`border-b border-line last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-paper' : ''}`}
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-ink/60">
                  {formatDateTime(tx.createdAt)}
                </td>
                <td className="px-5 py-3.5 font-medium">{describeActor(tx)}</td>
                <td className="px-5 py-3.5 text-ink/70">{TYPE_LABEL[tx.type] || tx.type}</td>
                <td className="px-5 py-3.5 text-right tabular-nums font-medium">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tx.status] || 'bg-paper text-ink/60'}`}
                  >
                    {STATUS_LABEL[tx.status] || tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
