import axiosInstance from './axiosInstance'

export const getAllUsers = () => axiosInstance.get('/users').then((res) => res.data)
export const getUserById = (id) => axiosInstance.get(`/users/${id}`).then((res) => res.data)
export const createUser = (payload) => axiosInstance.post('/users', payload).then((res) => res.data)
export const updateUser = (id, payload) =>
  axiosInstance.put(`/users/${id}`, payload).then((res) => res.data)
export const deactivateUser = (id) =>
  axiosInstance.patch(`/users/${id}/deactivate`).then((res) => res.data)
export const activateUser = (id) =>
  axiosInstance.patch(`/users/${id}/activate`).then((res) => res.data)
