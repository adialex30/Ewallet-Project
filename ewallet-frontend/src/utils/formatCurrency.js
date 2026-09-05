const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export const formatCurrency = (value) => formatter.format(Number(value) || 0)

export const formatDateTime = (isoString) => {
  if (!isoString) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString))
}

// Strips everything but digits as the user types, so the nominal input can
// never contain symbols/letters/decimals in the first place - matching the
// backend's whole-positive-integer validation rule.
export const digitsOnly = (value) => value.replace(/[^\d]/g, '')
