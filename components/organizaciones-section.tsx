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
        return <Badge className="bg-booster-green/10 text-booster-green border-booster-green/20">Activa</Badge>
      case "Pendiente":
        return <Badge className="bg-booster-orange/10 text-booster-orange border-booster-orange/20">Pendiente</Badge>
      case "Inactiva":
        return <Badge className="bg-booster-red/10 text-booster-red border-booster-red/20">Inactiva</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Organizaciones</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-blue/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-booster-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{organizaciones.length}</div>
            <p className="text-xs text-booster-green">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Organizaciones Activas</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-green/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-booster-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {organizaciones.filter((org) => org.estado === "Activa").length}
            </div>
            <p className="text-xs text-booster-green">80% del total</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Empleados</CardTitle>
            <div className="h-8 w-8 rounded-full bg-booster-orange/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-booster-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {organizaciones.reduce((sum, org) => sum + org.empleados, 0)}
            </div>
            <p className="text-xs text-gray-600">Across all organizations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Gestión de Organizaciones</CardTitle>
              <CardDescription className="text-gray-600">
                Administra y supervisa todas las organizaciones registradas
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Organización
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar organizaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700">Organización</TableHead>
                  <TableHead className="text-gray-700">Tipo</TableHead>
                  <TableHead className="text-gray-700">Empleados</TableHead>
                  <TableHead className="text-gray-700">Estado</TableHead>
                  <TableHead className="text-gray-700">Fecha Creación</TableHead>
                  <TableHead className="text-right text-gray-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizaciones.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{org.nombre}</div>
                        <div className="text-sm text-gray-600">{org.contacto}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{org.tipo}</TableCell>
                    <TableCell className="text-gray-700">{org.empleados}</TableCell>
                    <TableCell>{getStatusBadge(org.estado)}</TableCell>
                    <TableCell className="text-gray-700">{org.fechaCreacion}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Desactivar</DropdownMenuItem>
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
