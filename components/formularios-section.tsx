"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react"

const formularios = [
  {
    id: 1,
    titulo: "Solicitud de Vacaciones - Juan Pérez",
    tipo: "Vacaciones",
    estado: "Pendiente",
    fechaEnvio: "2024-01-15",
    solicitante: "Juan Pérez",
    departamento: "Desarrollo",
  },
  {
    id: 2,
    titulo: "Evaluación Desempeño Q1 - María García",
    tipo: "Evaluación",
    estado: "Completado",
    fechaEnvio: "2024-01-20",
    solicitante: "María García",
    departamento: "Marketing",
  },
  {
    id: 3,
    titulo: "Reporte Incidente - Servidor Principal",
    tipo: "Incidente",
    estado: "En Revisión",
    fechaEnvio: "2024-02-01",
    solicitante: "Carlos López",
    departamento: "IT",
  },
  {
    id: 4,
    titulo: "Solicitud Presupuesto - Campaña Q2",
    tipo: "Presupuesto",
    estado: "Aprobado",
    fechaEnvio: "2024-02-05",
    solicitante: "Ana Martín",
    departamento: "Marketing",
  },
  {
    id: 5,
    titulo: "Registro Nuevo Empleado - David Silva",
    tipo: "Registro",
    estado: "Rechazado",
    fechaEnvio: "2024-02-10",
    solicitante: "HR System",
    departamento: "Recursos Humanos",
  },
]

export function FormulariosSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEstado, setSelectedEstado] = useState("Todos")

  const filteredFormularios = formularios.filter((form) => {
    const matchesSearch =
      form.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = selectedEstado === "Todos" || form.estado === selectedEstado
    return matchesSearch && matchesEstado
  })

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Completado":
        return (
          <Badge className="bg-booster-green/10 text-booster-green border-booster-green/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completado
          </Badge>
        )
      case "Pendiente":
        return (
          <Badge className="bg-booster-orange/10 text-booster-orange border-booster-orange/20">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        )
      case "En Revisión":
        return (
          <Badge className="bg-booster-blue/10 text-booster-blue border-booster-blue/20">
            <FileText className="mr-1 h-3 w-3" />
            En Revisión
          </Badge>
        )
      case "Aprobado":
        return (
          <Badge className="bg-booster-green/10 text-booster-green border-booster-green/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Aprobado
          </Badge>
        )
      case "Rechazado":
        return (
          <Badge className="bg-booster-red/10 text-booster-red border-booster-red/20">
            <XCircle className="mr-1 h-3 w-3" />
            Rechazado
          </Badge>
        )
      default:
        return <Badge>{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lista" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="lista">Lista de Formularios</TabsTrigger>
            <TabsTrigger value="nuevo">Crear Formulario</TabsTrigger>
          </TabsList>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Formulario
          </Button>
        </div>

        <TabsContent value="lista" className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-booster-gray-600">Total Formularios</CardTitle>
                <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-booster-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-booster-gray-900">{formularios.length}</div>
                <p className="text-xs text-booster-green">+3 nuevos hoy</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-booster-gray-600">Pendientes</CardTitle>
                <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-booster-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-booster-gray-900">
                  {formularios.filter((f) => f.estado === "Pendiente").length}
                </div>
                <p className="text-xs text-booster-green">Requieren atención</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-booster-gray-600">Completados</CardTitle>
                <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-booster-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-booster-gray-900">
                  {formularios.filter((f) => f.estado === "Completado" || f.estado === "Aprobado").length}
                </div>
                <p className="text-xs text-booster-green">Este mes</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-booster-gray-600">Tasa de Aprobación</CardTitle>
                <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-booster-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-booster-gray-900">80%</div>
                <p className="text-xs text-booster-green">Últimos 30 días</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar formularios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Revisión">En Revisión</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Formularios Recientes</CardTitle>
              <CardDescription className="text-gray-600">
                Lista de todos los formularios enviados y su estado actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-700">Formulario</TableHead>
                      <TableHead className="text-gray-700">Tipo</TableHead>
                      <TableHead className="text-gray-700">Solicitante</TableHead>
                      <TableHead className="text-gray-700">Departamento</TableHead>
                      <TableHead className="text-gray-700">Estado</TableHead>
                      <TableHead className="text-gray-700">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFormularios.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell>
                          <div className="font-medium">{form.titulo}</div>
                        </TableCell>
                        <TableCell className="text-gray-700">{form.tipo}</TableCell>
                        <TableCell className="text-gray-700">{form.solicitante}</TableCell>
                        <TableCell className="text-gray-700">{form.departamento}</TableCell>
                        <TableCell>{getStatusBadge(form.estado)}</TableCell>
                        <TableCell className="text-gray-700">{form.fechaEnvio}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nuevo" className="space-y-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Crear Nuevo Formulario</CardTitle>
              <CardDescription className="text-gray-600">
                Completa la información para crear un nuevo formulario personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título del Formulario</Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Solicitud de Vacaciones"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rrhh">Recursos Humanos</SelectItem>
                      <SelectItem value="finanzas">Finanzas</SelectItem>
                      <SelectItem value="it">Tecnología</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="seguridad">Seguridad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el propósito y uso de este formulario..."
                  className="min-h-[100px] bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento Responsable</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rrhh">Recursos Humanos</SelectItem>
                      <SelectItem value="finanzas">Finanzas</SelectItem>
                      <SelectItem value="desarrollo">Desarrollo</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="ventas">Ventas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridad">Nivel de Prioridad</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Campos del Formulario</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Input
                      placeholder="Nombre del campo"
                      className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    />
                    <Select>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="select">Selección</SelectItem>
                        <SelectItem value="textarea">Área de texto</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      Eliminar
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Campo
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline">Guardar como Borrador</Button>
                <Button>Crear Formulario</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
