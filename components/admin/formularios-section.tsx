"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Eye, Trash2, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface Formulario {
  id: string
  tipo: 'auditoria' | 'voluntariado' | 'beneficiario' | 'comunidad'
  titulo: string
  descripcion: string
  fechaCreacion: string
  fechaVencimiento: string
  estado: 'activo' | 'cerrado' | 'borrador'
  respuestas: number
  creador: string
}

export function AdminFormulariosSection() {
  const [formularios, setFormularios] = useState<Formulario[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarFormularios()
  }, [])

  const cargarFormularios = async () => {
    setLoading(true)
    try {
      const formulariosEjemplo: Formulario[] = [
        {
          id: "1",
          tipo: "auditoria",
          titulo: "Evaluación de Procesos Comunitarios Q1 2024",
          descripcion: "Formulario para evaluar la efectividad de los procesos implementados en las comunidades durante el primer trimestre",
          fechaCreacion: "2024-01-15",
          fechaVencimiento: "2024-03-31",
          estado: "cerrado",
          respuestas: 45,
          creador: "María González"
        },
        {
          id: "2",
          tipo: "voluntariado",
          titulo: "Registro de Nuevos Voluntarios 2024",
          descripcion: "Formulario de inscripción para voluntarios interesados en participar en los programas de la organización",
          fechaCreacion: "2024-01-01",
          fechaVencimiento: "2024-12-31",
          estado: "activo",
          respuestas: 156,
          creador: "Carlos Ramírez"
        },
        {
          id: "3",
          tipo: "beneficiario",
          titulo: "Evaluación de Satisfacción - Programa Abrazando Leyendas",
          descripcion: "Encuesta para medir la satisfacción de los beneficiarios del programa Abrazando Leyendas",
          fechaCreacion: "2024-02-10",
          fechaVencimiento: "2024-04-10",
          estado: "activo",
          respuestas: 78,
          creador: "Ana Martínez"
        },
        {
          id: "4",
          tipo: "comunidad",
          titulo: "Diagnóstico de Necesidades Comunitarias",
          descripcion: "Formulario para identificar las principales necesidades y prioridades de cada comunidad",
          fechaCreacion: "2024-03-01",
          fechaVencimiento: "2024-05-01",
          estado: "borrador",
          respuestas: 0,
          creador: "Pedro Torres"
        },
        {
          id: "5",
          tipo: "auditoria",
          titulo: "Auditoria de Transparencia y Rendición de Cuentas",
          descripcion: "Evaluación de procesos de transparencia y manejo de recursos organizacionales",
          fechaCreacion: "2024-03-15",
          fechaVencimiento: "2024-06-15",
          estado: "activo",
          respuestas: 23,
          creador: "Luisa Fernández"
        }
      ]
      setFormularios(formulariosEjemplo)
    } finally {
      setLoading(false)
    }
  }

  const eliminarFormulario = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este formulario? Esta acción no se puede deshacer.')) return

    setLoading(true)
    try {
      setFormularios(prev => prev.filter(f => f.id !== id))
      toast.success('Formulario eliminado exitosamente')
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (id: string, nuevoEstado: 'activo' | 'cerrado' | 'borrador') => {
    setLoading(true)
    try {
      setFormularios(prev => prev.map(f => 
        f.id === id ? { ...f, estado: nuevoEstado } : f
      ))
      toast.success(`Formulario ${nuevoEstado === 'activo' ? 'activado' : nuevoEstado === 'cerrado' ? 'cerrado' : 'guardado como borrador'} exitosamente`)
    } finally {
      setLoading(false)
    }
  }

  const exportarRespuestas = async (id: string, titulo: string) => {
    toast.success(`Exportando respuestas de "${titulo}"...`)
    // Aquí implementarías la lógica de exportación
  }

  const getTipoColor = (tipo: string) => {
    const colores = {
      auditoria: 'bg-purple-100 text-purple-700',
      voluntariado: 'bg-blue-100 text-blue-700',
      beneficiario: 'bg-green-100 text-green-700',
      comunidad: 'bg-orange-100 text-orange-700'
    }
    return colores[tipo as keyof typeof colores] || 'bg-gray-100 text-gray-700'
  }

  const getEstadoColor = (estado: string) => {
    const colores = {
      activo: 'bg-green-100 text-green-800 hover:bg-green-200',
      cerrado: 'bg-red-100 text-red-800 hover:bg-red-200',
      borrador: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    }
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="h-4 w-4" />
      case 'cerrado':
        return <Clock className="h-4 w-4" />
      case 'borrador':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const estaVencido = (fechaVencimiento: string) => {
    return new Date(fechaVencimiento) < new Date()
  }

  const calcularDiasRestantes = (fechaVencimiento: string) => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = vencimiento.getTime() - hoy.getTime()
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Formularios</h2>
          <p className="text-gray-600">Administra todos los formularios del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{formularios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-xl font-bold">{formularios.filter(f => f.estado === 'activo').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Cerrados</p>
                <p className="text-xl font-bold">{formularios.filter(f => f.estado === 'cerrado').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Borradores</p>
                <p className="text-xl font-bold">{formularios.filter(f => f.estado === 'borrador').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Respuestas</p>
                <p className="text-xl font-bold">{formularios.reduce((sum, f) => sum + f.respuestas, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen por Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['auditoria', 'voluntariado', 'beneficiario', 'comunidad'].map(tipo => (
          <Card key={tipo}>
            <CardContent className="p-4">
              <div className="text-center">
                <Badge className={getTipoColor(tipo)}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </Badge>
                <p className="text-xl font-bold mt-2">
                  {formularios.filter(f => f.tipo === tipo).length}
                </p>
                <p className="text-xs text-gray-600">
                  {formularios.filter(f => f.tipo === tipo).reduce((sum, f) => sum + f.respuestas, 0)} respuestas
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla de Formularios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Formularios</CardTitle>
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
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Creador</TableHead>
                  <TableHead>Respuestas</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formularios.map((formulario) => (
                  <TableRow key={formulario.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{formulario.titulo}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {formulario.descripcion}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(formulario.tipo)}>
                        {formulario.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{formulario.creador}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold">{formulario.respuestas}</span>
                        {formulario.respuestas > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportarRespuestas(formulario.id, formulario.titulo)}
                            className="h-6 w-6 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(formulario.fechaVencimiento).toLocaleDateString()}</p>
                        {formulario.estado === 'activo' && (
                          <p className={`text-xs ${estaVencido(formulario.fechaVencimiento) ? 'text-red-600' : 'text-gray-500'}`}>
                            {estaVencido(formulario.fechaVencimiento) 
                              ? 'Vencido' 
                              : `${calcularDiasRestantes(formulario.fechaVencimiento)} días restantes`
                            }
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getEstadoIcon(formulario.estado)}
                        <Badge className={getEstadoColor(formulario.estado)}>
                          {formulario.estado}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info('Función de vista previa en desarrollo')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {formulario.estado === 'activo' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cambiarEstado(formulario.id, 'cerrado')}
                          >
                            <Clock className="h-3 w-3" />
                          </Button>
                        )}
                        {formulario.estado === 'cerrado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cambiarEstado(formulario.id, 'activo')}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarFormulario(formulario.id)}
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
