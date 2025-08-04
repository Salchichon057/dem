"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MoreHorizontal, Building2, Users, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const organizaciones = [
  {
    id: 1,
    nombre: "TechCorp Solutions",
    tipo: "Tecnología",
    empleados: 150,
    estado: "Activa",
    fechaCreacion: "2023-01-15",
    contacto: "admin@techcorp.com",
  },
  {
    id: 2,
    nombre: "Marketing Plus",
    tipo: "Marketing",
    empleados: 45,
    estado: "Activa",
    fechaCreacion: "2023-03-22",
    contacto: "info@marketingplus.com",
  },
  {
    id: 3,
    nombre: "FinanceHub",
    tipo: "Finanzas",
    empleados: 89,
    estado: "Pendiente",
    fechaCreacion: "2023-05-10",
    contacto: "contact@financehub.com",
  },
  {
    id: 4,
    nombre: "HealthCare Pro",
    tipo: "Salud",
    empleados: 200,
    estado: "Activa",
    fechaCreacion: "2022-11-08",
    contacto: "support@healthcarepro.com",
  },
  {
    id: 5,
    nombre: "EduTech Institute",
    tipo: "Educación",
    empleados: 75,
    estado: "Inactiva",
    fechaCreacion: "2023-02-28",
    contacto: "hello@edutech.com",
  },
]

export function OrganizacionesSection() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrganizaciones = organizaciones.filter(
    (org) =>
      org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Activa":
        return <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 shadow-sm">✓ Activa</Badge>
      case "Pendiente":
        return <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200 shadow-sm">⏳ Pendiente</Badge>
      case "Inactiva":
        return <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200 shadow-sm">✕ Inactiva</Badge>
      default:
        return <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 card-hover-effect overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Total Organizaciones</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {organizaciones.length}
            </div>
            <p className="text-sm text-green-600 font-medium flex items-center mt-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100 card-hover-effect overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Organizaciones Activas</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {organizaciones.filter((org) => org.estado === "Activa").length}
            </div>
            <p className="text-sm text-emerald-600 font-medium flex items-center mt-1">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              80% del total
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100 card-hover-effect overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-700">Total Empleados</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {organizaciones.reduce((sum, org) => sum + org.empleados, 0)}
            </div>
            <p className="text-sm text-purple-600 font-medium flex items-center mt-1">
              <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              En todas las organizaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 card-hover-effect">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                🏢 Gestión de Organizaciones
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Administra y supervisa todas las organizaciones registradas en el sistema
              </CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Organización
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar organizaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 shadow-sm"
              />
            </div>
            <Button variant="outline" className="border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100">
              Filtros
            </Button>
          </div>

          <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">🏢 Organización</TableHead>
                  <TableHead className="text-gray-700 font-semibold">🏷️ Tipo</TableHead>
                  <TableHead className="text-gray-700 font-semibold">👥 Empleados</TableHead>
                  <TableHead className="text-gray-700 font-semibold">📊 Estado</TableHead>
                  <TableHead className="text-gray-700 font-semibold">📅 Fecha Creación</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">⚙️ Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizaciones.map((org, index) => (
                  <TableRow 
                    key={org.id} 
                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{org.nombre}</div>
                          <div className="text-sm text-gray-500">{org.contacto}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                        {org.tipo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{org.empleados}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(org.estado)}</TableCell>
                    <TableCell className="text-gray-600 font-medium">{org.fechaCreacion}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-gray-200">
                          <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50">
                            👁️ Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50">
                            ✏️ Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50">
                            🚫 Desactivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
