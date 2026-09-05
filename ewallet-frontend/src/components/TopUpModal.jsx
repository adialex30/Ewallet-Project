import { useRef, useState } from 'react'
import { createTopup } from '../api/topupApi'
import { useMidtransSnap } from '../hooks/useMidtransSnap'
import { useToast } from '../context/ToastContext'
import { digitsOnly, formatCurrency } from '../utils/formatCurrency'
import Spinner from './Spinner'

const QUICK_AMOUNTS = ['25000', '50000', '100000', '250000']

export default function TopUpModal({ open, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)
  const { pay } = useMidtransSnap()
  const toast = useToast()

  if (!open) return null

  const reset = () => {
    setAmount('')
    setFieldError('')
    setSubmitting(false)
    submitLock.current = false
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Ref-based guard closes the gap a very fast double-click can slip
    // through before React re-renders the disabled button.
    if (submitLock.current) return
    submitLock.current = true

    setFieldError('')

    if (!amount) {
      setFieldError('Nominal tidak boleh kosong.')
      submitLock.current = false
      return
    }

    setSubmitting(true)

    try {
      const { orderId, snapToken } = await createTopup(amount)

      const outcome = await pay(snapToken)

      if (outcome.status === 'success' || outcome.status === 'pending') {
        toast.success(
          outcome.status === 'success'
            ? 'Pembayaran berhasil! Saldo akan diperbarui dalam beberapa saat.'
            : 'Pembayaran sedang diproses. Saldo akan diperbarui setelah konfirmasi.'
        )
        onSuccess(orderId)
        reset()
        onClose()
      } else {
        // Popup closed without finishing - not an error, just let them retry.
        setSubmitting(false)
        submitLock.current = false
      }
    } catch (err) {
      if (err?.errors?.amount) {
        setFieldError(err.errors.amount)
      } else {
        toast.error(err?.message || 'Gagal membuat transaksi top up.')
      }
      setSubmitting(false)
      submitLock.current = false
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Top Up Saldo</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-ink/40 hover:text-ink"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="topup-amount" className="text-sm font-medium text-ink/70">
            Nominal
          </label>
          <div className="mt-1.5 flex items-center rounded-lg border border-line px-3 focus-within:border-primary">
            <span className="text-sm text-ink/40">Rp</span>
            <input
              id="topup-amount"
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString('id-ID') : ''}
              onChange={(e) => setAmount(digitsOnly(e.target.value))}
              placeholder="0"
              disabled={submitting}
              className="w-full border-0 bg-transparent px-2 py-2.5 text-sm text-ink outline-none disabled:opacity-60"
            />
          </div>
          {fieldError && <p className="mt-1.5 text-sm text-danger">{fieldError}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((v) => (
              <button
                key={v}
                type="button"
                disabled={submitting}
                onClick={() => setAmount(v)}
                className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink/70 transition hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {formatCurrency(v)}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}
          </button>
        </form>
      </div>
    </div>
  )
}
