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
import { Plus, Edit, Trash2, Building2, Users, Globe, Phone } from "lucide-react"
import { toast } from "sonner"

interface Organizacion {
  id: string
  nombre: string
  tipo: 'ong' | 'fundacion' | 'cooperativa' | 'empresa' | 'gobierno'
  nit: string
  direccion: string
  telefono: string
  email: string
  sitioWeb: string
  representanteLegal: string
  descripcion: string
  estado: 'activa' | 'inactiva'
  fechaRegistro: string
  numeroEmpleados: number
}

export function AdminOrganizacionesSection() {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrganizacion, setEditingOrganizacion] = useState<Organizacion | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "ong" as 'ong' | 'fundacion' | 'cooperativa' | 'empresa' | 'gobierno',
    nit: "",
    direccion: "",
    telefono: "",
    email: "",
    sitioWeb: "",
    representanteLegal: "",
    descripcion: "",
    estado: "activa" as 'activa' | 'inactiva',
    numeroEmpleados: ""
  })

  useEffect(() => {
    cargarOrganizaciones()
  }, [])

  const cargarOrganizaciones = async () => {
    setLoading(true)
    try {
      const organizacionesEjemplo: Organizacion[] = [
        {
          id: "1",
          nombre: "Fundación Esperanza",
          tipo: "fundacion",
          nit: "900123456-7",
          direccion: "Calle 123 #45-67, Bogotá",
          telefono: "+57 1 234 5678",
          email: "info@fundacionesperanza.org",
          sitioWeb: "https://fundacionesperanza.org",
          representanteLegal: "María Elena Vargas",
          descripcion: "Fundación dedicada al desarrollo comunitario y educativo",
          estado: "activa",
          fechaRegistro: "2023-01-15",
          numeroEmpleados: 25
        },
        {
          id: "2",
          nombre: "ONG Manos Solidarias",
          tipo: "ong",
          nit: "900987654-3",
          direccion: "Carrera 30 #78-90, Medellín",
          telefono: "+57 4 567 8901",
          email: "contacto@manossolidarias.org",
          sitioWeb: "https://manossolidarias.org",
          representanteLegal: "Carlos Alberto Ruiz",
          descripcion: "Organización enfocada en ayuda humanitaria y desarrollo social",
          estado: "activa",
          fechaRegistro: "2023-03-22",
          numeroEmpleados: 15
        },
        {
          id: "3",
          nombre: "Cooperativa Agropecuaria del Valle",
          tipo: "cooperativa",
          nit: "900456789-1",
          direccion: "Km 5 Vía Palmira, Valle del Cauca",
          telefono: "+57 2 345 6789",
          email: "admin@coopvalle.coop",
          sitioWeb: "https://coopvalle.coop",
          representanteLegal: "Ana Lucía Torres",
          descripcion: "Cooperativa de productores agropecuarios del Valle del Cauca",
          estado: "activa",
          fechaRegistro: "2023-05-10",
          numeroEmpleados: 8
        }
      ]
      setOrganizaciones(organizacionesEjemplo)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipo: "ong",
      nit: "",
      direccion: "",
      telefono: "",
      email: "",
      sitioWeb: "",
      representanteLegal: "",
      descripcion: "",
      estado: "activa",
      numeroEmpleados: ""
    })
    setEditingOrganizacion(null)
  }

  const abrirModal = (organizacion?: Organizacion) => {
    if (organizacion) {
      setEditingOrganizacion(organizacion)
      setFormData({
        nombre: organizacion.nombre,
        tipo: organizacion.tipo,
        nit: organizacion.nit,
        direccion: organizacion.direccion,
        telefono: organizacion.telefono,
        email: organizacion.email,
        sitioWeb: organizacion.sitioWeb,
        representanteLegal: organizacion.representanteLegal,
        descripcion: organizacion.descripcion,
        estado: organizacion.estado,
        numeroEmpleados: organizacion.numeroEmpleados.toString()
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const guardarOrganizacion = async () => {
    if (!formData.nombre || !formData.nit || !formData.representanteLegal) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    setLoading(true)
    try {
      const nuevaOrganizacion: Organizacion = {
        id: editingOrganizacion?.id || Date.now().toString(),
        nombre: formData.nombre,
        tipo: formData.tipo,
        nit: formData.nit,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        sitioWeb: formData.sitioWeb,
        representanteLegal: formData.representanteLegal,
        descripcion: formData.descripcion,
        estado: formData.estado,
        numeroEmpleados: parseInt(formData.numeroEmpleados) || 0,
        fechaRegistro: editingOrganizacion?.fechaRegistro || new Date().toISOString().split('T')[0]
      }

      if (editingOrganizacion) {
        setOrganizaciones(prev => prev.map(o => o.id === editingOrganizacion.id ? nuevaOrganizacion : o))
        toast.success('Organización actualizada exitosamente')
      } else {
        setOrganizaciones(prev => [...prev, nuevaOrganizacion])
        toast.success('Organización creada exitosamente')
      }

      setModalOpen(false)
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  const eliminarOrganizacion = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta organización?')) return

    setLoading(true)
    try {
      setOrganizaciones(prev => prev.filter(o => o.id !== id))
      toast.success('Organización eliminada exitosamente')
    } finally {
      setLoading(false)
    }
  }

  const getTipoColor = (tipo: string) => {
    const colores = {
      ong: 'bg-blue-100 text-blue-700',
      fundacion: 'bg-green-100 text-green-700',
      cooperativa: 'bg-purple-100 text-purple-700',
      empresa: 'bg-orange-100 text-orange-700',
      gobierno: 'bg-red-100 text-red-700'
    }
    return colores[tipo as keyof typeof colores] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Organizaciones</h2>
          <p className="text-gray-600">Administra las organizaciones aliadas del sistema</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nueva Organización</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editingOrganizacion ? 'Editar Organización' : 'Nueva Organización'}
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
                    placeholder="Nombre de la organización"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value: 'ong' | 'fundacion' | 'cooperativa' | 'empresa' | 'gobierno') => 
                    setFormData(prev => ({ ...prev, tipo: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ong">ONG</SelectItem>
                      <SelectItem value="fundacion">Fundación</SelectItem>
                      <SelectItem value="cooperativa">Cooperativa</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                      <SelectItem value="gobierno">Gobierno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nit">NIT *</Label>
                  <Input
                    id="nit"
                    value={formData.nit}
                    onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                    placeholder="900123456-7"
                  />
                </div>
                <div>
                  <Label htmlFor="numeroEmpleados">Número de Empleados</Label>
                  <Input
                    id="numeroEmpleados"
                    type="number"
                    value={formData.numeroEmpleados}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroEmpleados: e.target.value }))}
                    placeholder="25"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Calle 123 #45-67, Ciudad"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+57 1 234 5678"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="info@organizacion.org"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sitioWeb">Sitio Web</Label>
                  <Input
                    id="sitioWeb"
                    value={formData.sitioWeb}
                    onChange={(e) => setFormData(prev => ({ ...prev, sitioWeb: e.target.value }))}
                    placeholder="https://organizacion.org"
                  />
                </div>
                <div>
                  <Label htmlFor="representanteLegal">Representante Legal *</Label>
                  <Input
                    id="representanteLegal"
                    value={formData.representanteLegal}
                    onChange={(e) => setFormData(prev => ({ ...prev, representanteLegal: e.target.value }))}
                    placeholder="Nombre completo"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción de la organización"
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
                <Button onClick={guardarOrganizacion} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? 'Guardando...' : editingOrganizacion ? 'Actualizar' : 'Crear'}
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
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{organizaciones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-xl font-bold">{organizaciones.filter(o => o.estado === 'activa').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Empleados</p>
                <p className="text-xl font-bold">{organizaciones.reduce((sum, o) => sum + o.numeroEmpleados, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Con Contacto</p>
                <p className="text-xl font-bold">{organizaciones.filter(o => o.telefono && o.email).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Organizaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizaciones</CardTitle>
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>NIT</TableHead>
                  <TableHead>Representante</TableHead>
                  <TableHead>Empleados</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizaciones.map((organizacion) => (
                  <TableRow key={organizacion.id}>
                    <TableCell className="font-medium">{organizacion.nombre}</TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(organizacion.tipo)}>
                        {organizacion.tipo.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{organizacion.nit}</TableCell>
                    <TableCell>{organizacion.representanteLegal}</TableCell>
                    <TableCell>{organizacion.numeroEmpleados}</TableCell>
                    <TableCell>
                      <Badge className={
                        organizacion.estado === 'activa' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }>
                        {organizacion.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModal(organizacion)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarOrganizacion(organizacion.id)}
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
