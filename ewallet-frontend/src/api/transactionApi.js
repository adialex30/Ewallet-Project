import axiosInstance from './axiosInstance'

export const getMyTransactions = () => axiosInstance.get('/transactions').then((res) => res.data)

// GET /api/transactions/all - system-wide activity log, ADMIN only
export const getAllTransactions = () => axiosInstance.get('/transactions/all').then((res) => res.data)

// GET /api/transactions/{id} - only the sender, recipient, or an ADMIN may view it
export const getTransactionById = (id) =>
  axiosInstance.get(`/transactions/${id}`).then((res) => res.data)
