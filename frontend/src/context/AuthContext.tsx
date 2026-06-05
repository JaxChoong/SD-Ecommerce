import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthContextType {
  role: 'user' | 'admin'
  adminToken: string | null
  username: string | null
  login: (u: string, p: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('ezshop_admin_token'))
  const [username, setUsername] = useState<string | null>(localStorage.getItem('ezshop_admin_username'))
  const [role, setRole] = useState<'user' | 'admin'>(adminToken ? 'admin' : 'user')

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('ezshop_admin_token', adminToken)
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
  }

  return (
    <AuthContext.Provider value={{ role, adminToken, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
