/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUserRole } from "@/hooks/use-user-role"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Loader2, Check, X, AlertTriangle, KeyRound } from "lucide-react"
import { ConfirmDialog } from "./confirm-dialog"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; user: UserWithRole | null }>({ open: false, user: null })
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
            role:roles!users_role_id_fkey(id, name, description)
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

    const isChangingSelf = roleDialog.user.id === userData?.id
    const isDemotingFromAdmin = roleDialog.user.role.name === 'admin'
    const newRole = roles.find(r => r.id === roleDialog.newRoleId)

    try {
      const { error } = await supabase
        .from('users')
        .update({ role_id: roleDialog.newRoleId })
        .eq('id', roleDialog.user.id)

      if (error) throw error

      if (isChangingSelf && isDemotingFromAdmin && newRole?.name !== 'admin') {
        toast.success(`Rol cambiado a ${newRole?.name}. Redirigiendo...`, {
          duration: 2000
        })
        
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        await fetchData()
        setRoleDialog({ open: false, user: null, newRoleId: null })
        toast.success('Rol actualizado correctamente')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Error al cambiar rol')
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
      toast.error('Error al cambiar estado')
    } finally {
      setUpdating(null)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.user) return

    setUpdating(resetPasswordDialog.user.id)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetPasswordDialog.user.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al resetear contraseña')
      }

      toast.success(`Contraseña reseteada exitosamente`, {
        description: `Nueva contraseña: ${data.defaultPassword}`,
        duration: 10000
      })
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Error al resetear contraseña')
    } finally {
      setUpdating(null)
      setResetPasswordDialog({ open: false, user: null })
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
    
    // Si el usuario objetivo es admin y NO eres tú, no mostrar opciones
    if (targetUserIsAdmin && targetUser.id !== userData?.id) {
      return []
    }
    
    // Si es tu propio usuario admin, mostrar todas las opciones (incluyendo admin)
    if (targetUserIsAdmin && targetUser.id === userData?.id) {
      return roles
    }
    
    // Para otros usuarios, admin puede asignar editor y viewer
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
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium capitalize ${
                        user.role?.name === 'admin' 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : user.role?.name === 'editor' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role?.name || 'viewer'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {canEdit && availableRoles.length > 0 ? (
                      <Select
                        value={user.role.id}
                        onValueChange={(newRoleId) => setRoleDialog({ open: true, user, newRoleId })}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              <span className="capitalize">{role.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResetPasswordDialog({ open: true, user })}
                            disabled={isUpdating}
                            title="Resetear contraseña"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
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
                        </>
                      )}
                    </div>
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
        description={
          <>
            <p>
              ¿Cambiar el rol de <strong>{roleDialog.user?.name || roleDialog.user?.email}</strong> de{' '}
              <span className="capitalize font-semibold text-purple-600">{roleDialog.user?.role.name}</span> a{' '}
              <span className="capitalize font-semibold text-purple-600">
                {roles.find(r => r.id === roleDialog.newRoleId)?.name}
              </span>?
            </p>
            {roleDialog.user?.id === userData?.id && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>ATENCIÓN:</strong> Estás cambiando tu propio rol. Si te degradas de Admin, NO podrás revertirlo por ti mismo.
                </div>
              </div>
            )}
          </>
        }
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

      <ConfirmDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => !open && setResetPasswordDialog({ open: false, user: null })}
        title="Resetear Contraseña"
        description={
          <>
            <p>¿Resetear la contraseña de {resetPasswordDialog.user?.name || resetPasswordDialog.user?.email}?</p>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Contraseña temporal:</strong> <code className="bg-amber-100 px-2 py-0.5 rounded">userABC123++</code>
              </p>
              {/* <p className="text-xs text-amber-700 mt-2">
                El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
              </p> */}
            </div>
          </>
        }
        confirmText="Resetear Contraseña"
        onConfirm={handleResetPassword}
        variant="default"
      />
    </div>
  )
}
