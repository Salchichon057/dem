"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface RolePermissions {
  forms?: {
    read?: boolean
    create?: boolean
    update?: boolean
    delete?: boolean
  }
  users?: {
    manage?: boolean
  }
  submissions?: {
    view_all?: boolean
    export?: boolean
    delete?: boolean
  }
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: RolePermissions
}

export interface UserData {
  id: string
  email: string
  name: string
  role_id: string
  avatar_url: string | null
  is_active: boolean
  role?: UserRole
}

export function useUserRole() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchUserRole = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError
        if (!authUser) {
          setUserData(null)
          setLoading(false)
          return
        }

        const { data, error: dbError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            name,
            role_id,
            avatar_url,
            is_active,
            role:roles!inner(
              id,
              name,
              description,
              permissions
            )
          `)
          .eq('id', authUser.id)
          .single()

        if (dbError) throw dbError

        const userData: UserData = {
          ...data,
          role: Array.isArray(data.role) ? data.role[0] : data.role
        }

        setUserData(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar rol de usuario')
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const hasPermission = (resource: keyof RolePermissions, action: string): boolean => {
    if (!userData?.role?.permissions) return false
    
    const resourcePermissions = userData.role.permissions[resource]
    if (!resourcePermissions) return false
    
    return resourcePermissions[action as keyof typeof resourcePermissions] === true
  }

  const isAdmin = (): boolean => {
    return userData?.role?.name === 'admin'
  }

  const isEditor = (): boolean => {
    return userData?.role?.name === 'editor'
  }

  const isViewer = (): boolean => {
    return userData?.role?.name === 'viewer'
  }

  return {
    userData,
    role: userData?.role,
    loading,
    error,
    hasPermission,
    isAdmin,
    isEditor,
    isViewer
  }
}
