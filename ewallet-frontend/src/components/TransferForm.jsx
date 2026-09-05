import { useRef, useState } from 'react'
import { transfer } from '../api/transferApi'
import { useToast } from '../context/ToastContext'
import { digitsOnly } from '../utils/formatCurrency'
import Spinner from './Spinner'

export default function TransferForm({ onSuccess }) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submitLock.current) return
    submitLock.current = true
    setErrors({})

    const nextErrors = {}
    if (!recipient.trim()) nextErrors.recipient = 'Email atau nomor HP penerima wajib diisi.'
    if (!amount) nextErrors.amount = 'Nominal tidak boleh kosong.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      submitLock.current = false
      return
    }

    setSubmitting(true)

    try {
      await transfer(recipient.trim(), amount)
      toast.success(`Berhasil mengirim ke ${recipient.trim()}.`)
      setRecipient('')
      setAmount('')
      onSuccess()
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)
      } else if (err.status === 404) {
        toast.error('Pengguna tidak ditemukan. Periksa kembali email/nomor HP penerima.')
      } else if (err.status === 400) {
        toast.error(err.message || 'Saldo tidak cukup untuk transfer ini.')
      } else {
        toast.error(err.message || 'Transfer gagal, silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h2 className="font-display text-base font-semibold">Kirim Saldo</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="recipient" className="text-sm font-medium text-ink/70">
            Penerima (email atau nomor HP)
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={submitting}
            placeholder="nama@email.com atau 0812xxxxxxx"
            className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none disabled:opacity-60 ${
              errors.recipient ? 'border-danger' : 'border-line focus:border-primary'
            }`}
          />
          {errors.recipient && <p className="mt-1 text-sm text-danger">{errors.recipient}</p>}
        </div>

        <div>
          <label htmlFor="transfer-amount" className="text-sm font-medium text-ink/70">
            Nominal
          </label>
          <div
            className={`mt-1.5 flex items-center rounded-lg border px-3 ${
              errors.amount ? 'border-danger' : 'border-line focus-within:border-primary'
            }`}
          >
            <span className="text-sm text-ink/40">Rp</span>
            <input
              id="transfer-amount"
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString('id-ID') : ''}
              onChange={(e) => setAmount(digitsOnly(e.target.value))}
              placeholder="0"
              disabled={submitting}
              className="w-full border-0 bg-transparent px-2 py-2.5 text-sm outline-none disabled:opacity-60"
            />
          </div>
          {errors.amount && <p className="mt-1 text-sm text-danger">{errors.amount}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? 'Mengirim...' : 'Kirim'}
        </button>
      </form>
    </div>
  )
}
