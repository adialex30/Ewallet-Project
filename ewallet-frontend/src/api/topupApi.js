import axiosInstance from './axiosInstance'

export const createTopup = (amount) =>
    axiosInstance.post('/topup', { amount }).then((res) => res.data)

export const syncTopupStatus = (orderId) =>
    axiosInstance.post(`/topup/${orderId}/sync`).then((res) => res.data)