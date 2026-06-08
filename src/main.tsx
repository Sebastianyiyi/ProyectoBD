import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from '@/lib/msalInstance'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import './index.css'
import App from './App.tsx'

async function bootstrap() {
  await msalInstance.initialize()

  let redirectResult = null

  try {
    redirectResult = await msalInstance.handleRedirectPromise()
  } catch (e) {
    console.error('Error en handleRedirectPromise:', e)
  }

  const account = redirectResult?.account ?? msalInstance.getAllAccounts()[0] ?? null

  if (account) {
    msalInstance.setActiveAccount(account)

    try {
      let accessToken = redirectResult?.accessToken ?? null

      if (!accessToken) {
        const tokenResult = await msalInstance.acquireTokenSilent({
          scopes: ['User.Read', 'openid', 'profile', 'email'],
          account,
        })
        accessToken = tokenResult.accessToken
      }

      if (accessToken) {
        let dbUser = null;
        try {
          // Obtener el usuario real de la base de datos usando el correo
          const res = await api.get(`/usuarios/correo/${account.username}`);
          if (res.data) {
            dbUser = res.data;
          }
        } catch (err) {
          console.warn('Usuario no encontrado en la base de datos. Usando mock local.', err);
        }

        useAuthStore.getState().setAuth(
          dbUser || {
            id_usuario: 0,
            cedula: '',
            nombres: account.name?.split(' ')[0] ?? '',
            apellidos: account.name?.split(' ').slice(1).join(' ') ?? '',
            correo: account.username,
            fecha_registro: new Date().toISOString(),
            id_rol: 1,
            id_estado_usuario: 1,
          },
          accessToken
        )
      }
    } catch (e) {
      console.error('Error adquiriendo token:', e)
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </MsalProvider>
    </StrictMode>,
  )
}

bootstrap()