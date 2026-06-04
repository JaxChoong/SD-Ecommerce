import { useState, useEffect } from 'react'

export function DuitnowQr() {
  const [seconds, setSeconds] = useState(900)

  useEffect(() => {
    if (seconds <= 0) return
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(interval)
  }, [seconds])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="flex flex-col items-center gap-3 mt-3">
      <div className="h-48 w-48 bg-surface rounded-radius flex items-center justify-center">
        <div className="h-40 w-40 bg-foreground/10 rounded-radius flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-32 w-32">
            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" />
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
            <rect x="30" y="30" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
            <rect x="40" y="40" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20" />
            <circle cx="50" cy="50" r="3" fill="currentColor" className="text-muted-foreground/40" />
          </svg>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Scan with your banking app. Expires in {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </p>
    </div>
  )
}
