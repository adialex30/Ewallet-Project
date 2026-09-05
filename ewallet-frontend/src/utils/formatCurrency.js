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

export const digitsOnly = (value) => value.replace(/[^\d]/g, '')
