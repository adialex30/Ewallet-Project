import axiosInstance from './axiosInstance'

export const getMyWallet = () => axiosInstance.get('/wallet').then((res) => res.data)

export const getMyBalance = () => axiosInstance.get('/wallet/balance').then((res) => res.data)

export const withdraw = (amount) =>
  axiosInstance.post('/wallet/withdraw', { amount }).then((res) => res.data)


// ===== Admin/owner ID-based lookups (kept alongside the current-user endpoints above) =====

// GET /api/wallet/{walletId} - ADMIN can view any wallet, USER only their own
export const getWalletById = (walletId) =>
  axiosInstance.get(`/wallet/${walletId}`).then((res) => res.data)

// GET /api/wallet/{walletId}/transactions - ADMIN can view any wallet's history
export const getWalletTransactions = (walletId) =>
  axiosInstance.get(`/wallet/${walletId}/transactions`).then((res) => res.data)
