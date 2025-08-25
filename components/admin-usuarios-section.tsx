"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, User, Shield, Key } from "lucide-react"
import { toast } from "sonner"

interface Usuario {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  rol: 'admin' | 'coordinador' | 'voluntario' | 'usuario'
  estado: 'activo' | 'inactivo' | 'suspendido'
  fechaRegistro: string
  ultimoAcceso: string
  organizacion: string
}

export default function AdminUsuariosSection() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [resetPasswordModal, setResetPasswordModal] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    rol: "usuario" as 'admin' | 'coordinador' | 'voluntario' | 'usuario',
    estado: "activo" as 'activo' | 'inactivo' | 'suspendido',
    organizacion: ""
  })

  const rolesDisponibles = [
    { value: "admin", label: "Administrador" },
    { value: "coordinador", label: "Coordinador" },
    { value: "voluntario", label: "Voluntario" },
    { value: "usuario", label: "Usuario" }
  ]

  const organizacionesDisponibles = [
    "Fundación Esperanza",
    "ONG Manos Solidarias",
    "Cooperativa Agropecuaria del Valle",
    "Fundación Desarrollo Comunitario",
    "Sistema Central"
  ]

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      console.log('🔄 Cargando usuarios desde la API...')
      const response = await fetch('/api/usuarios')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Usuarios cargados:', data.length)
        setUsuarios(data)
      } else {
        console.error('❌ Error al cargar usuarios:', response.statusText)
        toast.error('Error al cargar usuarios')
        // Fallback con datos vacíos
        setUsuarios([])
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error)
      toast.error('Error de conexión al servidor')
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellidos: "",
      email: "",
      telefono: "",
      rol: "usuario",
      estado: "activo",
      organizacion: ""
    })
    setEditingUsuario(null)
  }

  const abrirModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario)
      setFormData({
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        estado: usuario.estado,
        organizacion: usuario.organizacion
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const guardarUsuario = async () => {
    if (!formData.nombre || !formData.apellidos || !formData.email) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    setLoading(true)
    try {
      if (editingUsuario) {
        // Actualizar usuario existente
        console.log('📝 Actualizando usuario existente:', editingUsuario.id)
        const response = await fetch(`/api/usuarios/${editingUsuario.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const updatedUser = await response.json()
          setUsuarios(prev => prev.map(u => u.id === editingUsuario.id ? updatedUser : u))
          toast.success('Usuario actualizado exitosamente')
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al actualizar usuario')
          return
        }
      } else {
        // Crear nuevo usuario
        console.log('👤 Creando nuevo usuario:', formData)
        const response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            password: '123456' // Contraseña por defecto
          })
        })

        if (response.ok) {
          const newUser = await response.json()
          setUsuarios(prev => [...prev, newUser])
          toast.success('Usuario creado exitosamente')
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al crear usuario')
          return
        }
      }

      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('❌ Error al guardar usuario:', error)
      toast.error('Error de conexión al servidor')
    } finally {
      setLoading(false)
    }
  }

  const eliminarUsuario = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return

    setLoading(true)
    try {
      console.log('🗑️ Eliminando usuario:', id)
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsuarios(prev => prev.filter(u => u.id !== id))
        toast.success('Usuario eliminado exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error)
      toast.error('Error de conexión al servidor')
    } finally {
      setLoading(false)
    }
  }

  const resetearContrasena = async () => {
    if (!editingUsuario) return

    setLoading(true)
    try {
      console.log('🔐 Reseteando contraseña para usuario:', editingUsuario.id)
      const response = await fetch(`/api/usuarios/${editingUsuario.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: '123456'
        })
      })

      if (response.ok) {
        toast.success('Contraseña reseteada a "123456" exitosamente')
        setResetPasswordModal(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al resetear contraseña')
      }
    } catch (error) {
      console.error('❌ Error al resetear contraseña:', error)
      toast.error('Error de conexión al servidor')
    } finally {
      setLoading(false)
    }
  }

  const getRolColor = (rol: string) => {
    const colores = {
      admin: 'bg-red-100 text-red-700',
      coordinador: 'bg-blue-100 text-blue-700',
      voluntario: 'bg-green-100 text-green-700',
      usuario: 'bg-gray-100 text-gray-700'
    }
    return colores[rol as keyof typeof colores] || 'bg-gray-100 text-gray-700'
  }

  const getEstadoColor = (estado: string) => {
    const colores = {
      activo: 'bg-green-100 text-green-700',
      inactivo: 'bg-gray-100 text-gray-700',
      suspendido: 'bg-red-100 text-red-700'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border shadow-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 bg-white p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Nombre"
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                    placeholder="Apellidos"
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="usuario@email.com"
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+57 300 123 4567"
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rol">Rol</Label>
                  <Select value={formData.rol} onValueChange={(value: 'admin' | 'coordinador' | 'voluntario' | 'usuario') => 
                    setFormData(prev => ({ ...prev, rol: value }))
                  }>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {rolesDisponibles.map(rol => (
                        <SelectItem key={rol.value} value={rol.value}>{rol.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value: 'activo' | 'inactivo' | 'suspendido') => 
                    setFormData(prev => ({ ...prev, estado: value }))
                  }>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="organizacion">Organización</Label>
                <Select value={formData.organizacion} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, organizacion: value }))
                }>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccionar organización" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {organizacionesDisponibles.map(org => (
                      <SelectItem key={org} value={org}>{org}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4 bg-white">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={guardarUsuario} disabled={loading}>
                  {loading ? 'Guardando...' : editingUsuario ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal de Reset Contraseña */}
      <Dialog open={resetPasswordModal} onOpenChange={setResetPasswordModal}>
        <DialogContent className="max-w-md bg-white border shadow-2xl">
          <DialogHeader>
            <DialogTitle>Resetear Contraseña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 bg-white p-4 rounded-lg">
            {editingUsuario && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Usuario:</p>
                <p className="text-lg font-semibold">{editingUsuario.nombre} {editingUsuario.apellidos}</p>
                <p className="text-sm text-gray-600">{editingUsuario.email}</p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              ¿Estás seguro de que deseas resetear la contraseña de este usuario? 
              La nueva contraseña será <strong>&quot;123456&quot;</strong>.
            </p>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setResetPasswordModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => resetearContrasena()} disabled={loading}>
                {loading ? 'Reseteando...' : 'Resetear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{usuarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-xl font-bold">{usuarios.filter(u => u.estado === 'activo').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-xl font-bold">{usuarios.filter(u => u.rol === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Coordinadores</p>
                <p className="text-xl font-bold">{usuarios.filter(u => u.rol === 'coordinador').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Organización</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      {usuario.nombre} {usuario.apellidos}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge className={getRolColor(usuario.rol)}>
                        {rolesDisponibles.find(r => r.value === usuario.rol)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{usuario.organizacion}</TableCell>
                    <TableCell>
                      <Badge className={getEstadoColor(usuario.estado)}>
                        {usuario.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(usuario.ultimoAcceso).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModal(usuario)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUsuario(usuario)
                            setResetPasswordModal(true)
                          }}
                        >
                          <Key className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarUsuario(usuario.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
