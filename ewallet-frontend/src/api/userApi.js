import axiosInstance from './axiosInstance'

// GET /api/users - ADMIN only
export const getAllUsers = () => axiosInstance.get('/users').then((res) => res.data)

// GET /api/users/{id} - ADMIN can view anyone, USER only their own (enforced server-side)
export const getUserById = (id) => axiosInstance.get(`/users/${id}`).then((res) => res.data)

// POST /api/users - matches AuthController.register's shape, role required
export const createUser = (payload) => axiosInstance.post('/users', payload).then((res) => res.data)

// PUT /api/users/{id} - password omitted/null means "keep current password"
export const updateUser = (id, payload) =>
  axiosInstance.put(`/users/${id}`, payload).then((res) => res.data)

// PATCH /api/users/{id}/deactivate - ADMIN only
export const deactivateUser = (id) =>
  axiosInstance.patch(`/users/${id}/deactivate`).then((res) => res.data)

// PATCH /api/users/{id}/activate - ADMIN only
export const activateUser = (id) =>
  axiosInstance.patch(`/users/${id}/activate`).then((res) => res.data)
