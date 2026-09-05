import { formatCurrency } from '../utils/formatCurrency'
import Spinner from './Spinner'

export default function BalanceCard({ balance, loading, onTopUp, onRefresh, refreshing }) {
  return (
    <div className="rounded-2xl bg-ink p-6 text-white sm:p-8">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Saldo Anda</span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Muat ulang saldo"
          className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <svg
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h5M20 20v-5h-5M4.5 9a7.5 7.5 0 0113-4.5M19.5 15a7.5 7.5 0 01-13 4.5"
            />
          </svg>
        </button>
      </div>

      <p className="mt-3 font-display text-4xl font-semibold tabular-nums sm:text-5xl">
        {loading ? (
          <span className="inline-block h-10 w-48 animate-pulse rounded bg-white/10 align-middle" />
        ) : (
          formatCurrency(balance)
        )}
      </p>

      <button
        type="button"
        onClick={onTopUp}
        className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark sm:w-auto sm:px-8"
      >
        Top Up Saldo
      </button>
    </div>
  )
}
