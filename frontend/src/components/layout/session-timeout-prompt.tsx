import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Clock } from 'lucide-react'

export function SessionTimeoutPrompt() {
  const { role, expiresAt, extendSession, logout } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(0)

  useEffect(() => {
    if (role !== 'admin' || !expiresAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPrompt(false)
      return
    }

    const interval = setInterval(() => {
      const expiryMs = new Date(expiresAt).getTime()
      const diffMs = expiryMs - Date.now()

      if (diffMs <= 0) {
        clearInterval(interval)
        setShowPrompt(false)
        logout()
      } else if (diffMs <= 5 * 60 * 1000) {
        // Show prompt if session expires in 5 minutes or less
        setShowPrompt(true)
        setSecondsRemaining(Math.ceil(diffMs / 1000))
      } else {
        setShowPrompt(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [role, expiresAt, logout])

  if (!showPrompt) return null

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-border/60 rounded-radius p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Session Timing Out</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Your administrator session is about to expire.</p>
          </div>
        </div>

        <div className="bg-background/40 border border-border/20 rounded-radius p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time Remaining</p>
          <p className="text-3xl font-mono font-bold text-foreground mt-1 tracking-tight">{timeFormatted}</p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          For security reasons, your admin session will end shortly due to inactivity. Would you like to extend your session for another 2 hours?
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            className="flex-1 order-last sm:order-none"
            onClick={extendSession}
          >
            Extend Session
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
