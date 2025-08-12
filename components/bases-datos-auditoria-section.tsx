"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Database, Calendar, Download, Upload, Server } from "lucide-react"
import { toast } from "sonner"

interface BaseDatos {
  id: string
  nombre: string
  descripcion: string
  tipo: "mysql" | "postgresql" | "mongodb" | "excel"
  tamaño: string
  registros: number
  fechaCreacion: string
  estado: "activa" | "inactiva" | "mantenimiento"
  ultimaActualizacion: string
}

export function BasesDatosAuditoriaSection() {
  const [basesDatos, setBasesDatos] = useState<BaseDatos[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    cargarBasesDatos()
  }, [])

  const cargarBasesDatos = async () => {
    try {
      setLoading(true)
      // Datos de ejemplo
      setBasesDatos([
        {
          id: "1",
          nombre: "BD_Organizaciones",
          descripcion: "Base de datos principal de organizaciones registradas",
          tipo: "postgresql",
          tamaño: "245 MB",
          registros: 1250,
          fechaCreacion: "2024-01-15",
          estado: "activa",
          ultimaActualizacion: "2025-01-17"
        },
        {
          id: "2",
          nombre: "BD_Comunidades",
          descripcion: "Información demográfica y operativa de comunidades",
          tipo: "postgresql",
          tamaño: "180 MB",
          registros: 850,
          fechaCreacion: "2024-02-10",
          estado: "activa",
          ultimaActualizacion: "2025-01-16"
        },
        {
          id: "3",
          nombre: "BD_Auditorias_Historico",
          descripcion: "Histórico de auditorías realizadas",
          tipo: "mysql",
          tamaño: "95 MB",
          registros: 520,
          fechaCreacion: "2024-03-01",
          estado: "mantenimiento",
          ultimaActualizacion: "2025-01-10"
        }
      ])
    } catch {
      toast.error('Error cargando bases de datos')
    } finally {
      setLoading(false)
    }
  }

  const filteredBases = basesDatos.filter(base =>
    base.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    base.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-green-100 text-green-700'
      case 'inactiva':
        return 'bg-gray-100 text-gray-700'
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'postgresql':
      case 'mysql':
        return <Server className="h-4 w-4 text-blue-600" />
      case 'mongodb':
        return <Database className="h-4 w-4 text-green-600" />
      case 'excel':
        return <Database className="h-4 w-4 text-orange-600" />
      default:
        return <Database className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando bases de datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bases de Datos</h1>
          <p className="text-gray-600">Gestiona las bases de datos del sistema de auditoría</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Base
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Bases</p>
                <p className="text-2xl font-bold text-gray-900">{basesDatos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {basesDatos.filter(b => b.estado === 'activa').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold text-gray-900">
                  {basesDatos.reduce((acc, b) => acc + b.registros, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">En Mantenimiento</p>
                <p className="text-2xl font-bold text-gray-900">
                  {basesDatos.filter(b => b.estado === 'mantenimiento').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bases de Datos Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Registros</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBases.map((base) => (
                  <TableRow key={base.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{base.nombre}</p>
                        <p className="text-sm text-gray-600">{base.descripcion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTipoIcon(base.tipo)}
                        <span className="capitalize">{base.tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono">{base.registros.toLocaleString()}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono">{base.tamaño}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEstadoBadgeColor(base.estado)}>
                        {base.estado.charAt(0).toUpperCase() + base.estado.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(base.ultimaActualizacion)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Database className="h-4 w-4" />
                        </Button>
                      </div>
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
