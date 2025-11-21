/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, Shield, Camera, Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/hooks/use-user"

export function PerfilSection() {
  const { profile, loading, updateProfile } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
  })

  const handleSave = async () => {
    const result = await updateProfile(formData)
    if (result.success) {
      toast.success("Perfil actualizado correctamente")
      setIsEditing(false)
    } else {
      toast.error(result.error || "Error al actualizar perfil")
    }
  }

  if (loading) {
    return <div>Cargando perfil...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="h-8 w-8" />
          Mi Perfil
        </h1>
        <p className="text-purple-50 mt-2 text-lg">
          Gestiona tu información personal y configuraciones de cuenta
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Avatar Card */}
        <Card className="border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-fit">
                <div className="h-32 w-32 rounded-full ring-4 ring-purple-400 flex items-center justify-center bg-linear-to-br from-purple-100 to-blue-100 overflow-hidden">
                  {profile?.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-purple-600" />
                  )}
                </div>
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{profile?.name || 'Usuario'}</h3>
                <p className="text-sm text-purple-600 font-medium mt-1">{profile?.role || 'viewer'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="border-purple-200 shadow-xl">
          <CardHeader className="border-b border-purple-100 bg-linear-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2 text-gray-900">
                  <User className="h-6 w-6 text-purple-600" />
                  Información Personal
                </CardTitle>
                <CardDescription className="mt-1 text-gray-600">
                  Actualiza tu información personal
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing 
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                  : "bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                }
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre completo
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-purple-200 focus:border-purple-600 focus:ring-purple-600"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                    <span className="text-gray-900 font-medium">{profile?.name || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Correo electrónico
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-purple-200 focus:border-purple-600 focus:ring-purple-600"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                    <span className="text-gray-900 font-medium">{profile?.email || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de registro
                </Label>
                <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                  <span className="text-gray-900 font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES') : 'No disponible'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Rol
                </Label>
                <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                  <span className="text-gray-900 font-medium">{profile?.role || 'viewer'}</span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-purple-100">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
