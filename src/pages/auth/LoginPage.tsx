import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { useAuthStore } from '@/store/authStore'
import { loginRequest } from '@/lib/msalConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const { instance } = useMsal()
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useIsAuthenticated()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token || isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await instance.loginRedirect(loginRequest)
    } catch (e) {
      console.error(e)
      setError('No se pudo iniciar sesión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">GITT — FISEI</CardTitle>
          <CardDescription>Gestión de Inventario Tecnológico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            Iniciar sesión con Microsoft
          </Button>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Usa tu cuenta institucional @uta.edu.ec
          </p>
        </CardContent>
      </Card>
    </div>
  )
}