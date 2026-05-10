import { create } from 'zustand'
import type { Usuario } from '@/types'

interface AuthState {
  usuario: Usuario | null
  token: string | null
  setAuth: (usuario: Usuario, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: null,
  setAuth: (usuario, token) => {
    sessionStorage.setItem('token', token)
    set({ usuario, token })
  },
  clearAuth: () => {
    sessionStorage.removeItem('token')
    set({ usuario: null, token: null })
  },
}))