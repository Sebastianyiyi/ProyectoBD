import { create } from 'zustand'
import type { Usuario } from '@/types'

interface AuthState {
  usuario: Usuario | null
  token: string | null
  msalToken: string | null
  setAuth: (usuario: Usuario, token: string) => void
  setMsalToken: (msalToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: sessionStorage.getItem('token'),
  msalToken: null,
  setAuth: (usuario, token) => {
    sessionStorage.setItem('token', token)
    set({ usuario, token })
  },
  setMsalToken: (msalToken) => {
    set({ msalToken })
  },
  clearAuth: () => {
    sessionStorage.removeItem('token')
    set({ usuario: null, token: null, msalToken: null })
  },
}))