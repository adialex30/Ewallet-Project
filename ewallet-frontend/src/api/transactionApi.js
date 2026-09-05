import axiosInstance from './axiosInstance'

export const getMyTransactions = () => axiosInstance.get('/transactions').then((res) => res.data)

export const getAllTransactions = () => axiosInstance.get('/transactions/all').then((res) => res.data)

export const getTransactionById = (id) =>
  axiosInstance.get(`/transactions/${id}`).then((res) => res.data)
