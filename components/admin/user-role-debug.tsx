"use client"

import { useUserRole } from "@/hooks/use-user-role"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, User, CheckCircle, XCircle } from "lucide-react"

export function UserRoleDebug() {
  const { userData, role, loading, error, hasPermission, isAdmin, isEditor, isViewer } = useUserRole()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Cargando datos del usuario...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!userData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No hay usuario autenticado</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Información del Usuario</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-gray-600">ID:</p>
            <p className="font-mono text-xs">{userData.id}</p>
            
            <p className="text-gray-600">Email:</p>
            <p className="font-medium">{userData.email}</p>
            
            <p className="text-gray-600">Nombre:</p>
            <p className="font-medium">{userData.name}</p>
            
            <p className="text-gray-600">Activo:</p>
            <p>{userData.is_active ? '✅ Sí' : '❌ No'}</p>
          </div>
        </CardContent>
      </Card>

      {role && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Rol y Permisos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-gray-600">Rol:</p>
              <p className="font-bold text-purple-600 uppercase">{role.name}</p>
              
              <p className="text-gray-600">Descripción:</p>
              <p className="text-gray-700">{role.description}</p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-sm text-gray-700">Checks de Rol:</p>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAdmin() ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isAdmin() ? '✓' : '✗'} Admin
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isEditor() ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isEditor() ? '✓' : '✗'} Editor
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isViewer() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isViewer() ? '✓' : '✗'} Viewer
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-sm text-gray-700">Permisos de Formularios:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <PermissionItem label="Leer" value={hasPermission('forms', 'read')} />
                <PermissionItem label="Crear" value={hasPermission('forms', 'create')} />
                <PermissionItem label="Actualizar" value={hasPermission('forms', 'update')} />
                <PermissionItem label="Eliminar" value={hasPermission('forms', 'delete')} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-sm text-gray-700">Permisos de Usuarios:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <PermissionItem label="Gestionar" value={hasPermission('users', 'manage')} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-sm text-gray-700">Permisos de Submissions:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <PermissionItem label="Ver todos" value={hasPermission('submissions', 'view_all')} />
                <PermissionItem label="Exportar" value={hasPermission('submissions', 'export')} />
                <PermissionItem label="Eliminar" value={hasPermission('submissions', 'delete')} />
              </div>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                Ver JSON completo de permisos
              </summary>
              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(role.permissions, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PermissionItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}:</span>
      {value ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-400" />
      )}
    </div>
  )
}
