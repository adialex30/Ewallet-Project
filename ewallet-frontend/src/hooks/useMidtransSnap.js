import { useCallback, useEffect, useRef, useState } from 'react'

const SNAP_URL = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY

let loadPromise = null

function loadSnapScript() {
  if (window.snap) return Promise.resolve()

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SNAP_URL
      script.setAttribute('data-client-key', CLIENT_KEY)
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'))
      document.body.appendChild(script)
    })
  }

  return loadPromise
}


export function useMidtransSnap() {
  const [ready, setReady] = useState(Boolean(window.snap))
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    loadSnapScript()
      .then(() => mounted.current && setReady(true))
      .catch(() => mounted.current && setReady(false))
    return () => {
      mounted.current = false
    }
  }, [])

  const pay = useCallback((snapToken) => {
    return new Promise((resolve, reject) => {
      if (!window.snap) {
        reject(new Error('Midtrans Snap belum siap, coba lagi sebentar.'))
        return
      }

      window.snap.pay(snapToken, {
        onSuccess: (result) => resolve({ status: 'success', result }),
        onPending: (result) => resolve({ status: 'pending', result }),
        onError: (result) => reject(new Error(result?.status_message || 'Pembayaran gagal.')),
        onClose: () => resolve({ status: 'closed' }),
      })
    })
  }, [])

  return { ready, pay }
}
