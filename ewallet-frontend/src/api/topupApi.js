import axiosInstance from './axiosInstance'

// amount must be a whole-number string, e.g. "50000" - see NominalValidator on the backend.
export const createTopup = (amount) =>
  axiosInstance.post('/topup', { amount }).then((res) => res.data)
