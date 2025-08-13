"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, MapPin, Users, Eye } from "lucide-react"
import { toast } from "sonner"

interface Comunidad {
  id: string
  nombre: string
  ubicacion: string
  poblacion: number
  coordinador: string
  telefono: string
  email: string
  descripcion: string
  estado: 'activa' | 'inactiva'
  fechaRegistro: string
}

export function AdminComunidadesSection() {
  const [comunidades, setComunidades] = useState<Comunidad[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingComunidad, setEditingComunidad] = useState<Comunidad | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    poblacion: "",
    coordinador: "",
    telefono: "",
    email: "",
    descripcion: "",
    estado: "activa" as 'activa' | 'inactiva'
  })

  useEffect(() => {
    cargarComunidades()
  }, [])

  const cargarComunidades = async () => {
    setLoading(true)
    try {
      // Datos de ejemplo - aquí conectarías con tu API
      const comunidadesEjemplo: Comunidad[] = [
        {
          id: "1",
          nombre: "Barrio Los Pinos",
          ubicacion: "Zona Norte, Calle 45 #123",
          poblacion: 450,
          coordinador: "María González",
          telefono: "+57 300 123 4567",
          email: "maria.gonzalez@email.com",
          descripcion: "Comunidad urbana con enfoque en desarrollo juvenil",
          estado: "activa",
          fechaRegistro: "2024-01-15"
        },
        {
          id: "2",
          nombre: "Vereda El Rosario",
          ubicacion: "Zona Rural, Km 15 vía Pueblo",
          poblacion: 180,
          coordinador: "Carlos Ramírez",
          telefono: "+57 310 987 6543",
          email: "carlos.ramirez@email.com",
          descripcion: "Comunidad rural dedicada a agricultura sostenible",
          estado: "activa",
          fechaRegistro: "2024-02-20"
        },
        {
          id: "3",
          nombre: "Sector La Esperanza",
          ubicacion: "Zona Sur, Barrio Central",
          poblacion: 320,
          coordinador: "Ana Martínez",
          telefono: "+57 320 456 7890",
          email: "ana.martinez@email.com",
          descripcion: "Comunidad en proceso de consolidación urbana",
          estado: "inactiva",
          fechaRegistro: "2024-03-10"
        }
      ]
      setComunidades(comunidadesEjemplo)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      ubicacion: "",
      poblacion: "",
      coordinador: "",
      telefono: "",
      email: "",
      descripcion: "",
      estado: "activa"
    })
    setEditingComunidad(null)
  }

  const abrirModal = (comunidad?: Comunidad) => {
    if (comunidad) {
      setEditingComunidad(comunidad)
      setFormData({
        nombre: comunidad.nombre,
        ubicacion: comunidad.ubicacion,
        poblacion: comunidad.poblacion.toString(),
        coordinador: comunidad.coordinador,
        telefono: comunidad.telefono,
        email: comunidad.email,
        descripcion: comunidad.descripcion,
        estado: comunidad.estado
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const guardarComunidad = async () => {
    if (!formData.nombre || !formData.ubicacion || !formData.coordinador) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    setLoading(true)
    try {
      const nuevaComunidad: Comunidad = {
        id: editingComunidad?.id || Date.now().toString(),
        nombre: formData.nombre,
        ubicacion: formData.ubicacion,
        poblacion: parseInt(formData.poblacion) || 0,
        coordinador: formData.coordinador,
        telefono: formData.telefono,
        email: formData.email,
        descripcion: formData.descripcion,
        estado: formData.estado,
        fechaRegistro: editingComunidad?.fechaRegistro || new Date().toISOString().split('T')[0]
      }

      if (editingComunidad) {
        setComunidades(prev => prev.map(c => c.id === editingComunidad.id ? nuevaComunidad : c))
        toast.success('Comunidad actualizada exitosamente')
      } else {
        setComunidades(prev => [...prev, nuevaComunidad])
        toast.success('Comunidad creada exitosamente')
      }

      setModalOpen(false)
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  const eliminarComunidad = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta comunidad?')) return

    setLoading(true)
    try {
      setComunidades(prev => prev.filter(c => c.id !== id))
      toast.success('Comunidad eliminada exitosamente')
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (id: string, nuevoEstado: 'activa' | 'inactiva') => {
    setLoading(true)
    try {
      setComunidades(prev => prev.map(c => 
        c.id === id ? { ...c, estado: nuevoEstado } : c
      ))
      toast.success(`Comunidad ${nuevoEstado === 'activa' ? 'activada' : 'desactivada'} exitosamente`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Comunidades</h2>
          <p className="text-gray-600">Administra las comunidades registradas en el sistema</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nueva Comunidad</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editingComunidad ? 'Editar Comunidad' : 'Nueva Comunidad'}
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
                    placeholder="Nombre de la comunidad"
                  />
                </div>
                <div>
                  <Label htmlFor="poblacion">Población</Label>
                  <Input
                    id="poblacion"
                    type="number"
                    value={formData.poblacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, poblacion: e.target.value }))}
                    placeholder="Número de habitantes"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ubicacion">Ubicación *</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coordinador">Coordinador *</Label>
                  <Input
                    id="coordinador"
                    value={formData.coordinador}
                    onChange={(e) => setFormData(prev => ({ ...prev, coordinador: e.target.value }))}
                    placeholder="Nombre del coordinador"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="coordinador@email.com"
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción de la comunidad"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value: 'activa' | 'inactiva') => 
                  setFormData(prev => ({ ...prev, estado: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="inactiva">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-lg">
                <Button variant="outline" onClick={() => setModalOpen(false)} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </Button>
                <Button onClick={guardarComunidad} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? 'Guardando...' : editingComunidad ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{comunidades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-xl font-bold">{comunidades.filter(c => c.estado === 'activa').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Población Total</p>
                <p className="text-xl font-bold">{comunidades.reduce((sum, c) => sum + c.poblacion, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Promedio Población</p>
                <p className="text-xl font-bold">
                  {comunidades.length > 0 ? Math.round(comunidades.reduce((sum, c) => sum + c.poblacion, 0) / comunidades.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Comunidades */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Comunidades</CardTitle>
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
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Coordinador</TableHead>
                  <TableHead>Población</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comunidades.map((comunidad) => (
                  <TableRow key={comunidad.id}>
                    <TableCell className="font-medium">{comunidad.nombre}</TableCell>
                    <TableCell>{comunidad.ubicacion}</TableCell>
                    <TableCell>{comunidad.coordinador}</TableCell>
                    <TableCell>{comunidad.poblacion.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={
                        comunidad.estado === 'activa' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }>
                        {comunidad.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModal(comunidad)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cambiarEstado(
                            comunidad.id, 
                            comunidad.estado === 'activa' ? 'inactiva' : 'activa'
                          )}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarComunidad(comunidad.id)}
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
