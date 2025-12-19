import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SectionKey, RolePermissions, UserWithPermissions } from '@/lib/types/permissions'

interface UseUserPermissionsReturn {
  loading: boolean
  role: 'admin' | 'editor' | 'viewer' | null
  permissions: RolePermissions | null
  allowedSections: SectionKey[]
  canCreate: () => boolean
  canEdit: () => boolean
  canDelete: () => boolean
  canExport: () => boolean
  canManageUsers: () => boolean
  canFillForm: () => boolean
  canViewSection: (sectionKey: SectionKey) => boolean
  isAdmin: boolean
}

export function useUserPermissions(): UseUserPermissionsReturn {
  const [loading, setLoading] = useState(true)
  const [userPermissions, setUserPermissions] = useState<UserWithPermissions | null>(null)

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const response = await fetch('/api/user/permissions')
        if (!response.ok) {
          throw new Error('Failed to fetch permissions')
        }

        const data: UserWithPermissions = await response.json()
        setUserPermissions(data)
      } catch (error) {
        console.error('Error fetching user permissions:', error)
        setUserPermissions(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPermissions()
  }, [])

  const canCreate = () => {
    return userPermissions?.role.permissions.forms.create ?? false
  }

  const canEdit = () => {
    return userPermissions?.role.permissions.forms.update ?? false
  }

  const canDelete = () => {
    return userPermissions?.role.permissions.forms.delete ?? false
  }

  const canExport = () => {
    return userPermissions?.role.permissions.submissions.export ?? false
  }

  const canManageUsers = () => {
    return userPermissions?.role.permissions.users.manage ?? false
  }
  const canFillForm = () => {
    // Admin y Editor pueden responder formularios, Viewer solo ver
    const roleName = userPermissions?.role.name as 'admin' | 'editor' | 'viewer' | null
    return roleName === 'admin' || roleName === 'editor'
  }
  const canViewSection = (sectionKey: SectionKey): boolean => {
    if (!userPermissions) return false
    
    // Admin can view everything
    const roleName = userPermissions.role.name as 'admin' | 'editor' | 'viewer'
    if (roleName === 'admin') return true
    
    // Panel de Admin solo para admins (ya retornó true arriba si es admin)
    if (sectionKey === 'admin-panel') {
      return false
    }
    
    // Editor/Viewer check allowed sections
    return userPermissions.allowedSections.includes(sectionKey)
  }

  return {
    loading,
    role: userPermissions?.role.name ?? null,
    permissions: userPermissions?.role.permissions ?? null,
    allowedSections: userPermissions?.allowedSections ?? [],
    canCreate,
    canFillForm,
    canEdit,
    canDelete,
    canExport,
    canManageUsers,
    canViewSection,
    isAdmin: (userPermissions?.role.name ?? '') === 'admin'
  }
}
