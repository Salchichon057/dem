"use client"

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  name?: string
  email?: string
  avatar?: string
  role?: string
  createdAt?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        
        setUser(authUser)
        
        if (authUser) {
          setProfile({
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
            email: authUser.email || '',
            avatar: authUser.user_metadata?.avatar_url,
            role: authUser.user_metadata?.role || 'viewer',
            createdAt: authUser.created_at
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuario')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        setProfile({
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url,
          role: session.user.user_metadata?.role || 'viewer',
          createdAt: session.user.created_at
        })
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          avatar_url: updates.avatar
        }
      })
      
      if (error) throw error
      
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al actualizar perfil' 
      }
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    updateProfile
  }
}
