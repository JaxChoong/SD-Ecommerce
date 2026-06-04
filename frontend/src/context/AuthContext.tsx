import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextType {
  role: 'user' | 'admin'
  toggleRole: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'user' | 'admin'>('user')

  const toggleRole = () => {
    setRole((r) => (r === 'user' ? 'admin' : 'user'))
  }

  return (
    <AuthContext.Provider value={{ role, toggleRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
