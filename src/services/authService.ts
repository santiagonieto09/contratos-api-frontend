import api from './api'
import type { AuthResponse } from '@/types'

export const authService = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/register', { email, password })
    return data
  },

  async login(email: string, password: string): Promise<{ token: string }> {
    const { data } = await api.post<{ token: string }>('/login', { email, password })
    return data
  },

  async perfil() {
    const { data } = await api.get('/perfil')
    return data.usuario
  },
}
