import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthContextType {
  role: 'user' | 'admin'
  adminToken: string | null
  username: string | null
  expiresAt: string | null
  login: (u: string, p: string) => Promise<void>
  logout: () => Promise<void>
  extendSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('ezshop_admin_token'))
  const [username, setUsername] = useState<string | null>(localStorage.getItem('ezshop_admin_username'))
  const [expiresAt, setExpiresAt] = useState<string | null>(localStorage.getItem('ezshop_admin_expires_at'))
  const [role, setRole] = useState<'user' | 'admin'>(adminToken ? 'admin' : 'user')

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('ezshop_admin_token', adminToken)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole('admin')
    } else {
      localStorage.removeItem('ezshop_admin_token')
      setRole('user')
    }
  }, [adminToken])

  useEffect(() => {
    if (username) {
      localStorage.setItem('ezshop_admin_username', username)
    } else {
      localStorage.removeItem('ezshop_admin_username')
    }
  }, [username])

  useEffect(() => {
    if (expiresAt) {
      localStorage.setItem('ezshop_admin_expires_at', expiresAt)
    } else {
      localStorage.removeItem('ezshop_admin_expires_at')
    }
  }, [expiresAt])

  useEffect(() => {
    if (adminToken) {
      // Validate session on load
      fetch('/api/admin/session', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })
        .then((r) => {
          if (r.ok) {
            return r.json()
          } else {
            throw new Error('Expired')
          }
        })
        .then((data) => {
          setExpiresAt(data.expires_at || null)
        })
        .catch(() => {
          setAdminToken(null)
          setUsername(null)
          setExpiresAt(null)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (u: string, p: string) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: u, password: p }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Invalid credentials')
    }

    const data = await res.json()
    setAdminToken(data.token)
    setUsername(data.username)
    setExpiresAt(data.expires_at || null)
  }

  const logout = async () => {
    if (adminToken) {
      await fetch('/api/admin/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      }).catch(() => {})
    }
    setAdminToken(null)
    setUsername(null)
    setExpiresAt(null)
  }

  const extendSession = async () => {
    if (!adminToken) return
    try {
      const res = await fetch('/api/admin/session', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setExpiresAt(data.expires_at || null)
      } else {
        await logout()
      }
    } catch {
      await logout()
    }
  }

  return (
    <AuthContext.Provider value={{ role, adminToken, username, expiresAt, login, logout, extendSession }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
