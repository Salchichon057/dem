"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Download, Eye, Edit, Copy, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const plantillas = [
  {
    id: 1,
    nombre: "Formulario de Registro de Empleado",
    categoria: "Recursos Humanos",
    descripcion: "Plantilla completa para el registro de nuevos empleados con todos los campos necesarios",
    fechaCreacion: "2024-01-15",
    usos: 45,
    estado: "Activa",
    autor: "Admin Sistema",
    preview: "/placeholder.svg?height=200&width=300&text=Employee+Form",
  },
  {
    id: 2,
    nombre: "Evaluación de Desempeño",
    categoria: "Recursos Humanos",
    descripcion: "Plantilla para evaluaciones anuales y semestrales de empleados",
    fechaCreacion: "2024-01-20",
    usos: 32,
    estado: "Activa",
    autor: "HR Manager",
    preview: "/placeholder.svg?height=200&width=300&text=Performance+Review",
  },
  {
    id: 3,
    nombre: "Solicitud de Presupuesto",
    categoria: "Finanzas",
    descripcion: "Formulario estándar para solicitudes de presupuesto departamental",
    fechaCreacion: "2024-02-01",
    usos: 28,
    estado: "Activa",
    autor: "Finance Team",
    preview: "/placeholder.svg?height=200&width=300&text=Budget+Request",
  },
  {
    id: 4,
    nombre: "Reporte de Incidentes",
    categoria: "Seguridad",
    descripcion: "Plantilla para reportar incidentes de seguridad y accidentes laborales",
    fechaCreacion: "2024-02-10",
    usos: 15,
    estado: "Borrador",
    autor: "Security Team",
    preview: "/placeholder.svg?height=200&width=300&text=Incident+Report",
  },
  {
    id: 5,
    nombre: "Encuesta de Satisfacción",
    categoria: "Marketing",
    descripcion: "Plantilla para medir la satisfacción del cliente con productos y servicios",
    fechaCreacion: "2024-02-15",
    usos: 67,
    estado: "Activa",
    autor: "Marketing Team",
    preview: "/placeholder.svg?height=200&width=300&text=Satisfaction+Survey",
  },
  {
    id: 6,
    nombre: "Solicitud de Vacaciones",
    categoria: "Recursos Humanos",
    descripcion: "Formulario para solicitar días de vacaciones y permisos",
    fechaCreacion: "2024-02-20",
    usos: 89,
    estado: "Activa",
    autor: "HR System",
    preview: "/placeholder.svg?height=200&width=300&text=Vacation+Request",
  },
]

const categorias = ["Todas", "Recursos Humanos", "Finanzas", "Seguridad", "Marketing"]

export function PlantillasSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  const filteredPlantillas = plantillas.filter((plantilla) => {
    const matchesSearch =
      plantilla.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plantilla.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todas" || plantilla.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Activa":
        return <Badge className="bg-booster-green/10 text-booster-green border-booster-green/20">Activa</Badge>
      case "Borrador":
        return <Badge className="bg-booster-orange/10 text-booster-orange border-booster-orange/20">Borrador</Badge>
      case "Archivada":
        return <Badge className="bg-booster-gray-100 text-booster-gray-600 border-booster-gray-200">Archivada</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca de Plantillas</h2>
          <p className="text-gray-600">Gestiona y utiliza plantillas predefinidas para formularios</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-booster-gray-600">Total Plantillas</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-booster-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-booster-gray-900">{plantillas.length}</div>
            <p className="text-xs text-booster-green">+2 nuevas este mes</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-booster-gray-600">Plantillas Activas</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-booster-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-booster-gray-900">
              {plantillas.filter((p) => p.estado === "Activa").length}
            </div>
            <p className="text-xs text-booster-green">83% del total</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-booster-gray-600">Usos Totales</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-booster-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-booster-gray-900">
              {plantillas.reduce((sum, p) => sum + p.usos, 0)}
            </div>
            <p className="text-xs text-booster-green">Este mes</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-booster-gray-600">Más Popular</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-booster-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-booster-gray-900">89</div>
            <p className="text-xs text-booster-green">Solicitud de Vacaciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlantillas.map((plantilla) => (
          <Card key={plantilla.id} className="overflow-hidden border-0 shadow-sm bg-white">
            <div className="aspect-video bg-muted">
              <img
                src={plantilla.preview || "/placeholder.svg"}
                alt={plantilla.nombre}
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{plantilla.nombre}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{plantilla.categoria}</Badge>
                    {getStatusBadge(plantilla.estado)}
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm text-gray-600">{plantilla.descripcion}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Usos: {plantilla.usos}</span>
                  <span>Por: {plantilla.autor}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Eye className="mr-2 h-3 w-3" />
                    Vista Previa
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
