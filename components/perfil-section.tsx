"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, Shield, Camera } from "lucide-react"
import { toast } from "sonner"

export function PerfilSection() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario',
          email: data.user.email || ''
        })
        setFormData({
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario',
          email: data.user.email || ''
        })
      }
    })
  }, [])

  const handleSave = () => {
    // Aquí implementarías la lógica para actualizar el perfil
    toast.success("Perfil actualizado correctamente")
    setIsEditing(false)
  }

  const getUserInitials = (name: string | undefined | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" />
          Mi Perfil
        </h1>
        <p className="text-purple-100 mt-1">
          Gestiona tu información personal y configuraciones de cuenta
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="h-24 w-24 ring-4 ring-purple-200">
                <AvatarImage src={user?.avatar || '/placeholder.svg?height=96&width=96'} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold">
                  {getUserInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-lg">{user?.name || 'Usuario'}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {user?.role || 'Usuario'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Information Card */}
        <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className={isEditing ? "border-gray-300" : "bg-purple-600 hover:bg-purple-700"}
              >
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre completo
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{user?.name || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{user?.email || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Fecha de registro
                </Label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'No disponible'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Rol
                </Label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user?.role || 'Usuario'}</span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700"
                >
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
