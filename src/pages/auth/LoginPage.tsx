import { useEffect, useRef, useState } from 'react'
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrame = 0
    const pointer = { x: -9999, y: -9999, active: false }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const points = Array.from({ length: 72 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
    }))

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }

    const onLeave = () => {
      pointer.active = false
      pointer.x = -9999
      pointer.y = -9999
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const p of points) {
        p.x += p.vx
        p.y += p.vy

        if (p.x <= 0 || p.x >= window.innerWidth) p.vx *= -1
        if (p.y <= 0 || p.y >= window.innerHeight) p.vy *= -1

        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 140 && dist > 0.001) {
            const force = (140 - dist) / 140
            p.x += (dx / dist) * force * 1.1
            p.y += (dy / dist) * force * 1.1
          }
        }
      }

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i]
          const b = points[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 135) {
            const alpha = (1 - dist / 135) * 0.48
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(190, 30, 52, ${alpha})`
            ctx.lineWidth = 1.35
            ctx.stroke()
          }
        }
      }

      for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(190, 30, 52, 0.78)'
        ctx.fill()
      }

      animationFrame = window.requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="login-page">
      <canvas ref={canvasRef} className="login-network" />

      <div className="login-content">
        <Card className="login-card-fisei w-full max-w-sm">
          <div className="login-card-fisei-inner">
            <CardHeader className="text-center">
              <div className="login-kicker mx-auto">UTA · FISEI</div>
              <CardTitle className="login-title-fisei">GITT — FISEI</CardTitle>
              <CardDescription className="login-subtitle-fisei">
                Gestión de Inventario Tecnológico
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="login-microsoft-btn w-full flex items-center justify-center gap-3"
                variant="outline"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                >
                  <rect x="1" y="1" width="7" height="7" fill="#f25022" />
                  <rect x="10" y="1" width="7" height="7" fill="#7fba00" />
                  <rect x="1" y="10" width="7" height="7" fill="#00a4ef" />
                  <rect x="10" y="10" width="7" height="7" fill="#ffb900" />
                </svg>

                <span>{loading ? 'Redirigiendo...' : 'Iniciar sesión con Microsoft'}</span>
              </Button>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <p className="login-help-text">
                Usa tu cuenta institucional <span className="login-institution">@uta.edu.ec</span>
              </p>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  )
}