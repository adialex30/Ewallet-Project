import axiosInstance from './axiosInstance'

export const login = (email, password) =>
  axiosInstance.post('/auth/login', { email, password }).then((res) => res.data)

export const register = ({ fullName, email, phoneNumber, password }) =>
  axiosInstance
    .post('/auth/register', { fullName, email, phoneNumber, password, role: 'USER' })
    .then((res) => res.data)
