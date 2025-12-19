"use client"

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id?: string
  name?: string
  email?: string
  avatar?: string
  role?: string
  isActive?: boolean
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
          // Obtener datos completos del usuario desde la tabla users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              email,
              name,
              avatar_url,
              is_active,
              created_at,
              role:roles (
                name
              )
            `)
            .eq('id', authUser.id)
            .single()

          if (userError) {
            console.error('Error fetching user data:', userError)
            // Fallback a datos de auth si falla
            setProfile({
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
              email: authUser.email || '',
              avatar: authUser.user_metadata?.avatar_url,
              role: 'viewer',
              isActive: true,
              createdAt: authUser.created_at
            })
          } else {
            const userRole = Array.isArray(userData.role) ? userData.role[0] : userData.role
            setProfile({
              id: userData.id,
              name: userData.name || authUser.email?.split('@')[0] || 'Usuario',
              email: userData.email || authUser.email || '',
              avatar: userData.avatar_url,
              role: userRole?.name || 'viewer',
              isActive: userData.is_active,
              createdAt: userData.created_at
            })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuario')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Obtener datos completos del usuario desde la tabla users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            name,
            avatar_url,
            is_active,
            created_at,
            role:roles (
              name
            )
          `)
          .eq('id', session.user.id)
          .single()

        if (userError) {
          console.error('Error fetching user data:', userError)
          // Fallback
          setProfile({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url,
            role: 'viewer',
            isActive: true,
            createdAt: session.user.created_at
          })
        } else {
          const userRole = Array.isArray(userData.role) ? userData.role[0] : userData.role
          setProfile({
            id: userData.id,
            name: userData.name || session.user.email?.split('@')[0] || 'Usuario',
            email: userData.email || session.user.email || '',
            avatar: userData.avatar_url,
            role: userRole?.name || 'viewer',
            isActive: userData.is_active,
            createdAt: userData.created_at
          })
        }
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
      if (!user?.id) throw new Error('Usuario no autenticado')

      // Actualizar en la tabla users
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          avatar_url: updates.avatar
        })
        .eq('id', user.id)
      
      if (dbError) throw dbError

      // También actualizar en auth.users metadata para mantener sincronización
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          avatar_url: updates.avatar
        }
      })
      
      if (authError) throw authError
      
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

