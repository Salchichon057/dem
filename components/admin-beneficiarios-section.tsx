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
import { Plus, Edit, Trash2, Users, Heart, Calendar, MapPin } from "lucide-react"
import { toast } from "sonner"

interface Beneficiario {
  id: string
  nombre: string
  apellidos: string
  documento: string
  edad: number
  genero: 'masculino' | 'femenino' | 'otro'
  telefono: string
  direccion: string
  comunidad: string
  programa: string
  fechaIngreso: string
  estado: 'activo' | 'inactivo' | 'graduado'
  observaciones: string
}

export function AdminBeneficiariosSection() {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBeneficiario, setEditingBeneficiario] = useState<Beneficiario | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    documento: "",
    edad: "",
    genero: "masculino" as 'masculino' | 'femenino' | 'otro',
    telefono: "",
    direccion: "",
    comunidad: "",
    programa: "",
    estado: "activo" as 'activo' | 'inactivo' | 'graduado',
    observaciones: ""
  })

  const programasDisponibles = [
    "Abrazando Leyendas",
    "Desarrollo Comunitario",
    "Educación Integral",
    "Salud Preventiva",
    "Capacitación Laboral",
    "Apoyo Nutricional",
    "Desarrollo Juvenil"
  ]

  const comunidadesDisponibles = [
    "Barrio Los Pinos",
    "Vereda El Rosario", 
    "Sector La Esperanza",
    "Comuna El Progreso",
    "Barrio San José"
  ]

  useEffect(() => {
    cargarBeneficiarios()
  }, [])

  const cargarBeneficiarios = async () => {
    setLoading(true)
    try {
      const beneficiariosEjemplo: Beneficiario[] = [
        {
          id: "1",
          nombre: "María Elena",
          apellidos: "González Pérez",
          documento: "43.567.890",
          edad: 72,
          genero: "femenino",
          telefono: "+57 300 123 4567",
          direccion: "Calle 15 #23-45",
          comunidad: "Barrio Los Pinos",
          programa: "Abrazando Leyendas",
          fechaIngreso: "2024-01-15",
          estado: "activo",
          observaciones: "Participante muy activa en las actividades grupales"
        },
        {
          id: "2",
          nombre: "Carlos Alberto",
          apellidos: "Ramírez Silva",
          documento: "16.789.123",
          edad: 68,
          genero: "masculino",
          telefono: "+57 310 987 6543",
          direccion: "Carrera 8 #34-12",
          comunidad: "Vereda El Rosario",
          programa: "Salud Preventiva",
          fechaIngreso: "2024-02-10",
          estado: "activo",
          observaciones: "Requiere seguimiento médico especial"
        },
        {
          id: "3",
          nombre: "Ana Sofía",
          apellidos: "Martínez López",
          documento: "52.345.678",
          edad: 25,
          genero: "femenino",
          telefono: "+57 320 456 7890",
          direccion: "Transversal 12 #67-89",
          comunidad: "Sector La Esperanza",
          programa: "Capacitación Laboral",
          fechaIngreso: "2023-11-20",
          estado: "graduado",
          observaciones: "Completó exitosamente el programa de capacitación"
        },
        {
          id: "4",
          nombre: "Pedro José",
          apellidos: "Torres Vargas",
          documento: "79.123.456",
          edad: 75,
          genero: "masculino",
          telefono: "+57 315 234 5678",
          direccion: "Calle 45 #12-34",
          comunidad: "Barrio Los Pinos",
          programa: "Abrazando Leyendas",
          fechaIngreso: "2024-03-05",
          estado: "activo",
          observaciones: "Líder comunitario, excelente participación"
        }
      ]
      setBeneficiarios(beneficiariosEjemplo)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellidos: "",
      documento: "",
      edad: "",
      genero: "masculino",
      telefono: "",
      direccion: "",
      comunidad: "",
      programa: "",
      estado: "activo",
      observaciones: ""
    })
    setEditingBeneficiario(null)
  }

  const abrirModal = (beneficiario?: Beneficiario) => {
    if (beneficiario) {
      setEditingBeneficiario(beneficiario)
      setFormData({
        nombre: beneficiario.nombre,
        apellidos: beneficiario.apellidos,
        documento: beneficiario.documento,
        edad: beneficiario.edad.toString(),
        genero: beneficiario.genero,
        telefono: beneficiario.telefono,
        direccion: beneficiario.direccion,
        comunidad: beneficiario.comunidad,
        programa: beneficiario.programa,
        estado: beneficiario.estado,
        observaciones: beneficiario.observaciones
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const guardarBeneficiario = async () => {
    if (!formData.nombre || !formData.apellidos || !formData.documento) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    setLoading(true)
    try {
      const nuevoBeneficiario: Beneficiario = {
        id: editingBeneficiario?.id || Date.now().toString(),
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        documento: formData.documento,
        edad: parseInt(formData.edad) || 0,
        genero: formData.genero,
        telefono: formData.telefono,
        direccion: formData.direccion,
        comunidad: formData.comunidad,
        programa: formData.programa,
        estado: formData.estado,
        observaciones: formData.observaciones,
        fechaIngreso: editingBeneficiario?.fechaIngreso || new Date().toISOString().split('T')[0]
      }

      if (editingBeneficiario) {
        setBeneficiarios(prev => prev.map(b => b.id === editingBeneficiario.id ? nuevoBeneficiario : b))
        toast.success('Beneficiario actualizado exitosamente')
      } else {
        setBeneficiarios(prev => [...prev, nuevoBeneficiario])
        toast.success('Beneficiario creado exitosamente')
      }

      setModalOpen(false)
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  const eliminarBeneficiario = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este beneficiario?')) return

    setLoading(true)
    try {
      setBeneficiarios(prev => prev.filter(b => b.id !== id))
      toast.success('Beneficiario eliminado exitosamente')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    const colores = {
      activo: 'bg-green-100 text-green-700',
      inactivo: 'bg-red-100 text-red-700',
      graduado: 'bg-blue-100 text-blue-700'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-700'
  }

  const calcularEdadPromedio = () => {
    if (beneficiarios.length === 0) return 0
    return Math.round(beneficiarios.reduce((sum, b) => sum + b.edad, 0) / beneficiarios.length)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Beneficiarios</h2>
          <p className="text-gray-600">Administra los beneficiarios de los programas</p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Beneficiario</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editingBeneficiario ? 'Editar Beneficiario' : 'Nuevo Beneficiario'}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="documento">Documento *</Label>
                  <Input
                    id="documento"
                    value={formData.documento}
                    onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
                    placeholder="12.345.678"
                  />
                </div>
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
                  <Label htmlFor="genero">Género</Label>
                  <Select value={formData.genero} onValueChange={(value: 'masculino' | 'femenino' | 'otro') => 
                    setFormData(prev => ({ ...prev, genero: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Calle 123 #45-67"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comunidad">Comunidad</Label>
                  <Select value={formData.comunidad} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, comunidad: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar comunidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {comunidadesDisponibles.map(comunidad => (
                        <SelectItem key={comunidad} value={comunidad}>{comunidad}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="programa">Programa</Label>
                  <Select value={formData.programa} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, programa: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {programasDisponibles.map(programa => (
                        <SelectItem key={programa} value={programa}>{programa}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value: 'activo' | 'inactivo' | 'graduado') => 
                  setFormData(prev => ({ ...prev, estado: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="graduado">Graduado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Input
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Notas adicionales sobre el beneficiario"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-lg">
                <Button variant="outline" onClick={() => setModalOpen(false)} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </Button>
                <Button onClick={guardarBeneficiario} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? 'Guardando...' : editingBeneficiario ? 'Actualizar' : 'Crear'}
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
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{beneficiarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-xl font-bold">{beneficiarios.filter(b => b.estado === 'activo').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Edad Promedio</p>
                <p className="text-xl font-bold">{calcularEdadPromedio()} años</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Graduados</p>
                <p className="text-xl font-bold">{beneficiarios.filter(b => b.estado === 'graduado').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Beneficiarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Beneficiarios</CardTitle>
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
                  <TableHead>Documento</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Comunidad</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiarios.map((beneficiario) => (
                  <TableRow key={beneficiario.id}>
                    <TableCell className="font-medium">
                      {beneficiario.nombre} {beneficiario.apellidos}
                    </TableCell>
                    <TableCell>{beneficiario.documento}</TableCell>
                    <TableCell>{beneficiario.edad}</TableCell>
                    <TableCell>{beneficiario.comunidad}</TableCell>
                    <TableCell>{beneficiario.programa}</TableCell>
                    <TableCell>
                      <Badge className={getEstadoColor(beneficiario.estado)}>
                        {beneficiario.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModal(beneficiario)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarBeneficiario(beneficiario.id)}
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
