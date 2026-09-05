import axiosInstance from './axiosInstance'

export const transfer = (recipient, amount) =>
  axiosInstance.post('/transfer', { recipient, amount }).then((res) => res.data)
