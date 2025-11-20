/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUserRole } from "@/hooks/use-user-role"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Loader2, Check, X, Edit } from "lucide-react"
import { ConfirmDialog } from "./confirm-dialog"

interface UserWithRole {
  id: string
  email: string
  name: string
  is_active: boolean
  avatar_url: string | null
  role: {
    id: string
    name: string
    description: string
  }
}

interface Role {
  id: string
  name: string
  description: string
}

export function AdminUsersSection() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user: UserWithRole | null; newRoleId: string | null }>({ open: false, user: null, newRoleId: null })
  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; user: UserWithRole | null }>({ open: false, user: null })
  const { userData } = useUserRole()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    
    try {
      const [usersResult, rolesResult] = await Promise.all([
        supabase
          .from('users')
          .select(`
            id,
            email,
            name,
            is_active,
            avatar_url,
            role:roles!inner(id, name, description)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('roles')
          .select('id, name, description')
          .order('name')
      ])

      if (usersResult.data) {
        const usersWithRole: UserWithRole[] = usersResult.data.map((user: Record<string, unknown>) => ({
          ...user,
          role: Array.isArray(user.role) ? user.role[0] : user.role
        })) as UserWithRole[]
        setUsers(usersWithRole)
      }
      if (rolesResult.data) setRoles(rolesResult.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmRoleChange = async () => {
    if (!roleDialog.user || !roleDialog.newRoleId) return

    const supabase = createClient()
    setUpdating(roleDialog.user.id)

    try {
      const { error } = await supabase
        .from('users')
        .update({ role_id: roleDialog.newRoleId })
        .eq('id', roleDialog.user.id)

      if (error) throw error

      await fetchData()
      setRoleDialog({ open: false, user: null, newRoleId: null })
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error al cambiar rol')
    } finally {
      setUpdating(null)
    }
  }

  const confirmToggleActive = async () => {
    if (!deactivateDialog.user) return

    const supabase = createClient()
    setUpdating(deactivateDialog.user.id)

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !deactivateDialog.user.is_active })
        .eq('id', deactivateDialog.user.id)

      if (error) throw error

      await fetchData()
      setDeactivateDialog({ open: false, user: null })
    } catch (error) {
      console.error('Error toggling active status:', error)
      alert('Error al cambiar estado')
    } finally {
      setUpdating(null)
    }
  }

  const canEditUser = (targetUser: UserWithRole): boolean => {
    if (!userData) return false
    
    const currentUserIsAdmin = userData.role?.name === 'admin'
    const targetUserIsAdmin = targetUser.role.name === 'admin'
    
    // Admin NO puede editar otro admin
    if (currentUserIsAdmin && targetUserIsAdmin && targetUser.id !== userData.id) {
      return false
    }
    
    // Admin puede editar editor y viewer
    return currentUserIsAdmin
  }

  const getAvailableRoles = (targetUser: UserWithRole): Role[] => {
    const targetUserIsAdmin = targetUser.role.name === 'admin'
    
    // Si el usuario objetivo es admin, no mostrar opciones de cambio
    if (targetUserIsAdmin && targetUser.id !== userData?.id) {
      return []
    }
    
    // Admin puede asignar editor y viewer (no admin a otros)
    return roles.filter(r => r.name !== 'admin')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Usuarios del Sistema</h3>
          <p className="text-sm text-gray-600">Gestiona roles y permisos de usuarios</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {users.length} usuarios
        </Badge>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol Actual</TableHead>
              <TableHead>Cambiar Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const canEdit = canEditUser(user)
              const availableRoles = getAvailableRoles(user)
              const isUpdating = updating === user.id

              return (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 text-sm font-semibold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <span>{user.name || 'Sin nombre'}</span>
                      {user.id === userData?.id && (
                        <Badge variant="outline" className="text-xs">Tú</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        user.role.name === 'admin' ? 'destructive' : 
                        user.role.name === 'editor' ? 'default' : 
                        'secondary'
                      }
                      className="capitalize"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {canEdit && availableRoles.length > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRoleDialog({ open: true, user, newRoleId: availableRoles[0]?.id || null })}
                        disabled={isUpdating}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Cambiar Rol
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-400">No editable</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Check className="w-3 h-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <X className="w-3 h-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeactivateDialog({ open: true, user })}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.is_active ? (
                          'Desactivar'
                        ) : (
                          'Activar'
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Regla de negocio:</strong> Los administradores pueden auto-degradarse. Si cambias tu rol de Admin a Editor/Viewer, necesitarás que otro Admin te restaure.
        </p>
      </div>

      <ConfirmDialog
        open={roleDialog.open}
        onOpenChange={(open) => !open && setRoleDialog({ open: false, user: null, newRoleId: null })}
        title="Cambiar Rol de Usuario"
        description={`¿Estás seguro de cambiar el rol de ${roleDialog.user?.name || roleDialog.user?.email}? ${
          roleDialog.user?.id === userData?.id 
            ? '\n\n⚠️ ATENCIÓN: Estás cambiando tu propio rol. Si te degradas de Admin, NO podrás revertirlo por ti mismo.' 
            : ''
        }`}
        confirmText="Cambiar Rol"
        onConfirm={confirmRoleChange}
        variant={roleDialog.user?.id === userData?.id ? "destructive" : "default"}
      />

      <ConfirmDialog
        open={deactivateDialog.open}
        onOpenChange={(open) => !open && setDeactivateDialog({ open: false, user: null })}
        title={deactivateDialog.user?.is_active ? "Desactivar Usuario" : "Activar Usuario"}
        description={deactivateDialog.user?.is_active 
          ? `¿Desactivar a ${deactivateDialog.user?.name || deactivateDialog.user?.email}? Perderá acceso al sistema pero sus datos se conservarán.`
          : `¿Activar a ${deactivateDialog.user?.name || deactivateDialog.user?.email}? Recuperará acceso al sistema.`
        }
        confirmText={deactivateDialog.user?.is_active ? "Desactivar" : "Activar"}
        onConfirm={confirmToggleActive}
        variant={deactivateDialog.user?.is_active ? "destructive" : "default"}
      />
    </div>
  )
}
