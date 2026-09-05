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

function describeTransaction(tx, myWalletId) {
  if (tx.type === 'DEPOSIT') {
    return { label: 'Top Up', direction: 'in' }
  }
  if (tx.type === 'WITHDRAW') {
    return { label: 'Tarik Saldo', direction: 'out' }
  }
  if (tx.destinationWalletId === myWalletId) {
    const from = tx.sourceUserFullName
    return { label: from ? `Transfer Masuk dari ${from}` : 'Transfer Masuk', direction: 'in' }
  }
  const to = tx.destinationUserFullName
  return { label: to ? `Transfer Keluar ke ${to}` : 'Transfer Keluar', direction: 'out' }
}

export default function TransactionTable({ transactions, myWalletId, loading, onRowClick }) {
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
        <p className="font-display text-base font-semibold">Belum ada transaksi</p>
        <p className="mt-1 text-sm text-ink/60">
          Top up saldo pertama Anda untuk mulai bertransaksi.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink/50">
              <th className="px-5 py-3 font-medium">Tanggal</th>
              <th className="px-5 py-3 font-medium">Jenis</th>
              <th className="px-5 py-3 font-medium text-right">Nominal</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
            const { label, direction } = describeTransaction(tx, myWalletId)
            return (
              <tr
                key={tx.id}
                onClick={() => onRowClick?.(tx.id)}
                className={`border-b border-line last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-paper' : ''}`}
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-ink/60">
                  {formatDateTime(tx.createdAt)}
                </td>
                <td className="px-5 py-3.5 font-medium">{label}</td>
                <td
                  className={`px-5 py-3.5 text-right tabular-nums font-medium ${
                    direction === 'in' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {direction === 'in' ? '+' : '-'}
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
            )
          })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
