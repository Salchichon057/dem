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
import { Plus, Edit, Trash2, UserPlus, Clock, Award, Star } from "lucide-react"
import { toast } from "sonner"

interface Voluntario {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  edad: number
  area: string
  experiencia: string
  horasAcumuladas: number
  estado: 'activo' | 'inactivo' | 'suspendido'
  fechaIngreso: string
  habilidades: string[]
  disponibilidad: string[]
  calificacion: number
}

export function AdminVoluntariosSection() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVoluntario, setEditingVoluntario] = useState<Voluntario | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    edad: "",
    area: "",
    experiencia: "",
    estado: "activo" as 'activo' | 'inactivo' | 'suspendido',
    habilidades: "",
    disponibilidad: ""
  })

  const areasDisponibles = [
    "Educación",
    "Salud",
    "Medio Ambiente",
    "Tecnología", 
    "Deportes",
    "Arte y Cultura",
    "Desarrollo Comunitario",
    "Apoyo Administrativo"
  ]

  useEffect(() => {
    cargarVoluntarios()
  }, [])

  const cargarVoluntarios = async () => {
    setLoading(true)
    try {
      const voluntariosEjemplo: Voluntario[] = [
        {
          id: "1",
          nombre: "Andrea",
          apellidos: "Morales Castro",
          email: "andrea.morales@email.com",
          telefono: "+57 300 123 4567",
          edad: 28,
          area: "Educación",
          experiencia: "3 años en docencia comunitaria",
          horasAcumuladas: 156,
          estado: "activo",
          fechaIngreso: "2023-08-15",
          habilidades: ["Pedagogía", "Comunicación", "Liderazgo"],
          disponibilidad: ["Lunes", "Miércoles", "Sábados"],
          calificacion: 4.8
        },
        {
          id: "2",
          nombre: "Miguel",
          apellidos: "Torres Vega",
          email: "miguel.torres@email.com",
          telefono: "+57 310 987 6543",
          edad: 35,
          area: "Tecnología",
          experiencia: "5 años en desarrollo de software",
          horasAcumuladas: 203,
          estado: "activo",
          fechaIngreso: "2023-06-10",
          habilidades: ["Programación", "Diseño", "Capacitación"],
          disponibilidad: ["Martes", "Jueves", "Domingos"],
          calificacion: 4.9
        },
        {
          id: "3",
          nombre: "Carolina",
          apellidos: "Jiménez López",
          email: "carolina.jimenez@email.com",
          telefono: "+57 320 456 7890",
          edad: 42,
          area: "Salud",
          experiencia: "Enfermera con 10 años de experiencia",
          horasAcumuladas: 89,
          estado: "activo",
          fechaIngreso: "2024-01-20",
          habilidades: ["Primeros Auxilios", "Cuidado de Adultos Mayores", "Promoción de Salud"],
          disponibilidad: ["Lunes", "Martes", "Viernes"],
          calificacion: 4.7
        }
      ]
      setVoluntarios(voluntariosEjemplo)
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
      edad: "",
      area: "",
      experiencia: "",
      estado: "activo",
      habilidades: "",
      disponibilidad: ""
    })
    setEditingVoluntario(null)
  }

  const abrirModal = (voluntario?: Voluntario) => {
    if (voluntario) {
      setEditingVoluntario(voluntario)
      setFormData({
        nombre: voluntario.nombre,
        apellidos: voluntario.apellidos,
        email: voluntario.email,
        telefono: voluntario.telefono,
        edad: voluntario.edad.toString(),
        area: voluntario.area,
        experiencia: voluntario.experiencia,
        estado: voluntario.estado,
        habilidades: voluntario.habilidades.join(", "),
        disponibilidad: voluntario.disponibilidad.join(", ")
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const guardarVoluntario = async () => {
    if (!formData.nombre || !formData.apellidos || !formData.email) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    setLoading(true)
    try {
      const nuevoVoluntario: Voluntario = {
        id: editingVoluntario?.id || Date.now().toString(),
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        edad: parseInt(formData.edad) || 0,
        area: formData.area,
        experiencia: formData.experiencia,
        estado: formData.estado,
        habilidades: formData.habilidades.split(",").map(h => h.trim()).filter(h => h),
        disponibilidad: formData.disponibilidad.split(",").map(d => d.trim()).filter(d => d),
        horasAcumuladas: editingVoluntario?.horasAcumuladas || 0,
        calificacion: editingVoluntario?.calificacion || 5.0,
        fechaIngreso: editingVoluntario?.fechaIngreso || new Date().toISOString().split('T')[0]
      }

      if (editingVoluntario) {
        setVoluntarios(prev => prev.map(v => v.id === editingVoluntario.id ? nuevoVoluntario : v))
        toast.success('Voluntario actualizado exitosamente')
      } else {
        setVoluntarios(prev => [...prev, nuevoVoluntario])
        toast.success('Voluntario creado exitosamente')
      }

      setModalOpen(false)
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  const eliminarVoluntario = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este voluntario?')) return

    setLoading(true)
    try {
      setVoluntarios(prev => prev.filter(v => v.id !== id))
      toast.success('Voluntario eliminado exitosamente')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    const colores = {
      activo: 'bg-green-100 text-green-700',
      inactivo: 'bg-gray-100 text-gray-700',
      suspendido: 'bg-red-100 text-red-700'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-700'
  }

  const renderEstrellas = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(calificacion) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const calcularPromedioHoras = () => {
    if (voluntarios.length === 0) return 0
    return Math.round(voluntarios.reduce((sum, v) => sum + v.horasAcumuladas, 0) / voluntarios.length)
  }

  const calcularPromedioCalificacion = () => {
    if (voluntarios.length === 0) return 0
    return Math.round((voluntarios.reduce((sum, v) => sum + v.calificacion, 0) / voluntarios.length) * 10) / 10
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Voluntarios</h2>
          <p className="text-gray-600">Administra los voluntarios del programa</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Voluntario</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editingVoluntario ? 'Editar Voluntario' : 'Nuevo Voluntario'}
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
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                    placeholder="Apellidos"
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
                    placeholder="voluntario@email.com"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edad">Edad</Label>
                  <Input
                    id="edad"
                    type="number"
                    value={formData.edad}
                    onChange={(e) => setFormData(prev => ({ ...prev, edad: e.target.value }))}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="area">Área de Voluntariado</Label>
                  <Select value={formData.area} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, area: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areasDisponibles.map(area => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="experiencia">Experiencia</Label>
                <Input
                  id="experiencia"
                  value={formData.experiencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, experiencia: e.target.value }))}
                  placeholder="Describe tu experiencia relevante"
                />
              </div>
              <div>
                <Label htmlFor="habilidades">Habilidades (separadas por comas)</Label>
                <Input
                  id="habilidades"
                  value={formData.habilidades}
                  onChange={(e) => setFormData(prev => ({ ...prev, habilidades: e.target.value }))}
                  placeholder="Liderazgo, Comunicación, Organización"
                />
              </div>
              <div>
                <Label htmlFor="disponibilidad">Disponibilidad (días separados por comas)</Label>
                <Input
                  id="disponibilidad"
                  value={formData.disponibilidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, disponibilidad: e.target.value }))}
                  placeholder="Lunes, Miércoles, Sábados"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value: 'activo' | 'inactivo' | 'suspendido') => 
                  setFormData(prev => ({ ...prev, estado: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-lg">
                <Button variant="outline" onClick={() => setModalOpen(false)} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </Button>
                <Button onClick={guardarVoluntario} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? 'Guardando...' : editingVoluntario ? 'Actualizar' : 'Crear'}
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
              <UserPlus className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{voluntarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-xl font-bold">{voluntarios.filter(v => v.estado === 'activo').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Promedio Horas</p>
                <p className="text-xl font-bold">{calcularPromedioHoras()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Calificación</p>
                <p className="text-xl font-bold">{calcularPromedioCalificacion()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Voluntarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Voluntarios</CardTitle>
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
                  <TableHead>Área</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voluntarios.map((voluntario) => (
                  <TableRow key={voluntario.id}>
                    <TableCell className="font-medium">
                      {voluntario.nombre} {voluntario.apellidos}
                    </TableCell>
                    <TableCell>{voluntario.email}</TableCell>
                    <TableCell>{voluntario.area}</TableCell>
                    <TableCell>{voluntario.horasAcumuladas}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {renderEstrellas(voluntario.calificacion)}
                        <span className="text-xs text-gray-600 ml-1">
                          {voluntario.calificacion}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEstadoColor(voluntario.estado)}>
                        {voluntario.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModal(voluntario)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarVoluntario(voluntario.id)}
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
