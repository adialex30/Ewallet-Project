import axiosInstance from './axiosInstance'

export const getMyWallet = () => axiosInstance.get('/wallet').then((res) => res.data)

export const getMyBalance = () => axiosInstance.get('/wallet/balance').then((res) => res.data)

export const withdraw = (amount) =>
  axiosInstance.post('/wallet/withdraw', { amount }).then((res) => res.data)

export const getWalletById = (walletId) =>
  axiosInstance.get(`/wallet/${walletId}`).then((res) => res.data)
export const getWalletTransactions = (walletId) =>
  axiosInstance.get(`/wallet/${walletId}/transactions`).then((res) => res.data)
