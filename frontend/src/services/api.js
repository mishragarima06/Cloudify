import { apiClient } from '../context/AuthContext'

// ==================== AUTH APIS ====================

export const authAPI = {
  // Login: POST /api/auth/login
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password })
    return response.data
  },

  // Register: POST /api/auth/register
  register: async (email, password, name) => {
    const response = await apiClient.post('/api/auth/register', { email, password, name })
    return response.data
  },

  // Get logged-in user: GET /api/auth/me
  getMe: async () => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },

  // 2FA Setup: POST /api/auth/2fa/setup (returns QR code)
  setup2FA: async () => {
    const response = await apiClient.post('/api/auth/2fa/setup')
    return response.data
  },

  // Enable 2FA: POST /api/auth/2fa/enable (needs OTP to confirm)
  enable2FA: async (otp) => {
    const response = await apiClient.post('/api/auth/2fa/enable', { otp })
    return response.data
  },

  // Verify OTP: POST /api/auth/2fa/verify (OTP login during 2FA)
  verify2FA: async (token, otp) => {
    const response = await apiClient.post('/api/auth/2fa/verify', { token, otp })
    return response.data
  },

  // Logout: POST /api/auth/logout
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout')
    return response.data
  },
}

// ==================== FILE APIS ====================

export const fileAPI = {
  // Get all files: GET /api/files
  getFiles: async () => {
    const response = await apiClient.get('/api/files')
    return response.data
  },

  // Get single file: GET /api/files/:id
  getFile: async (id) => {
    const response = await apiClient.get(`/api/files/${id}`)
    return response.data
  },

  // Upload file: POST /api/files (FormData with file)
  uploadFile: async (formData) => {
    const response = await apiClient.post('/api/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Delete file: DELETE /api/files/:id
  deleteFile: async (id) => {
    const response = await apiClient.delete(`/api/files/${id}`)
    return response.data
  },

  // Share file: POST /api/files/:id/share
  shareFile: async (id, email) => {
    const response = await apiClient.post(`/api/files/${id}/share`, { email })
    return response.data
  },

  // Get file summary/tags: GET /api/files/:id/analysis
  getFileAnalysis: async (id) => {
    const response = await apiClient.get(`/api/files/${id}/analysis`)
    return response.data
  },
}

export default { authAPI, fileAPI }
