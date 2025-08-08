'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { SafeUser } from '@/lib/auth'

interface AuthContextType {
  user: SafeUser | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un token guardado al cargar
    const token = localStorage.getItem('auth-token')
    if (token) {
      // Aquí podrías verificar el token con el servidor
      // Por ahora, simplemente verificamos si existe
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setLoading(false)
        return
      }

      // Verificar token con el servidor
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        // Actualizar cookie
        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
      } else {
        // Token inválido
        localStorage.removeItem('auth-token')
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      localStorage.removeItem('auth-token')
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error en el login')
    }

    // Guardar token
    localStorage.setItem('auth-token', data.token)
    document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`
    
    setUser(data.user)
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error en el registro')
    }

    // Guardar token
    localStorage.setItem('auth-token', data.token)
    document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`
    
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
