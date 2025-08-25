'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Plus, Edit, Trash2, Calendar, User, Clock, CheckCircle } from 'lucide-react'

const entrevistasPimco = [
  {
    id: 1,
    titulo: 'Entrevista Inicial - Comunidad San José',
    tipo: 'inicial',
    fecha: '2024-01-15',
    entrevistado: 'María González (Líder Comunitaria)',
    entrevistador: 'Dr. Carlos Mendoza',
    estado: 'completada',
    duracion: '45 min',
    temas: ['Necesidades básicas', 'Infraestructura', 'Organización comunitaria'],
    resumen: 'La comunidad requiere mejoras en el sistema de agua potable y fortalecimiento de la organización local.',
    documentos: ['audio_entrevista_001.mp3', 'transcripcion_001.pdf', 'fotos_comunidad.zip']
  },
  {
    id: 2,
    titulo: 'Seguimiento - Proyecto Agua Potable',
    tipo: 'seguimiento',
    fecha: '2024-01-20',
    entrevistado: 'Juan Pérez (Coordinador de Proyecto)',
    entrevistador: 'Ing. Ana Rodríguez',
    estado: 'completada',
    duracion: '30 min',
    temas: ['Avance del proyecto', 'Desafíos técnicos', 'Participación comunitaria'],
    resumen: 'El proyecto avanza según cronograma. Se identificaron desafíos menores en la instalación de tuberías.',
    documentos: ['reporte_avance.pdf', 'fotos_obra.zip']
  },
  {
    id: 3,
    titulo: 'Evaluación - Comunidad Las Flores',
    tipo: 'evaluacion',
    fecha: '2024-01-25',
    entrevistado: 'Rosa María Sánchez (Presidenta Junta Vecinal)',
    entrevistador: 'Dra. Patricia López',
    estado: 'programada',
    duracion: '60 min',
    temas: ['Impacto de intervenciones', 'Sostenibilidad', 'Necesidades futuras'],
    resumen: '',
    documentos: []
  }
]

const tiposEntrevista = [
  { valor: 'inicial', etiqueta: 'Inicial', color: 'bg-blue-100 text-blue-800' },
  { valor: 'seguimiento', etiqueta: 'Seguimiento', color: 'bg-yellow-100 text-yellow-800' },
  { valor: 'evaluacion', etiqueta: 'Evaluación', color: 'bg-green-100 text-green-800' },
  { valor: 'cierre', etiqueta: 'Cierre', color: 'bg-purple-100 text-purple-800' }
]

const estadosEntrevista = [
  { valor: 'programada', etiqueta: 'Programada', color: 'bg-gray-100 text-gray-800' },
  { valor: 'completada', etiqueta: 'Completada', color: 'bg-green-100 text-green-800' },
  { valor: 'cancelada', etiqueta: 'Cancelada', color: 'bg-red-100 text-red-800' }
]

const getTipoBadge = (tipo: string) => {
  const tipoObj = tiposEntrevista.find(t => t.valor === tipo)
  return <Badge className={tipoObj?.color}>{tipoObj?.etiqueta}</Badge>
}

const getEstadoBadge = (estado: string) => {
  const estadoObj = estadosEntrevista.find(e => e.valor === estado)
  return <Badge className={estadoObj?.color}>{estadoObj?.etiqueta}</Badge>
}

export function PimcoEntrevistasSection() {
  const [selectedTab, setSelectedTab] = useState('lista')
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'inicial',
    fecha: '',
    entrevistado: '',
    entrevistador: '',
    duracion: '',
    temas: '',
    resumen: ''
  })

  const resetForm = () => {
    setFormData({
      titulo: '',
      tipo: 'inicial',
      fecha: '',
      entrevistado: '',
      entrevistador: '',
      duracion: '',
      temas: '',
      resumen: ''
    })
  }

  const handleCreate = () => {
    console.log('Crear entrevista:', formData)
    setIsCreating(false)
    resetForm()
  }

  const handleEdit = (entrevista: typeof entrevistasPimco[0]) => {
    setFormData({
      titulo: entrevista.titulo,
      tipo: entrevista.tipo,
      fecha: entrevista.fecha,
      entrevistado: entrevista.entrevistado,
      entrevistador: entrevista.entrevistador,
      duracion: entrevista.duracion,
      temas: entrevista.temas.join(', '),
      resumen: entrevista.resumen
    })
    setIsEditing(true)
  }

  const handleUpdate = () => {
    console.log('Actualizar entrevista:', formData)
    setIsEditing(false)
    resetForm()
  }

  const handleDelete = (id: number) => {
    console.log('Eliminar entrevista:', id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">PIMCO - Entrevistas</h2>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrevista
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Nueva Entrevista</DialogTitle>
              <DialogDescription>
                Complete la información para programar una nueva entrevista PIMCO
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título de la Entrevista</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Ej: Entrevista Inicial - Comunidad..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo de Entrevista</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    {tiposEntrevista.map(tipo => (
                      <option key={tipo.valor} value={tipo.valor}>{tipo.etiqueta}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="entrevistado">Entrevistado</Label>
                  <Input
                    id="entrevistado"
                    value={formData.entrevistado}
                    onChange={(e) => setFormData({...formData, entrevistado: e.target.value})}
                    placeholder="Nombre y cargo"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="entrevistador">Entrevistador</Label>
                  <Input
                    id="entrevistador"
                    value={formData.entrevistador}
                    onChange={(e) => setFormData({...formData, entrevistador: e.target.value})}
                    placeholder="Nombre del entrevistador"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duracion">Duración Estimada</Label>
                <Input
                  id="duracion"
                  value={formData.duracion}
                  onChange={(e) => setFormData({...formData, duracion: e.target.value})}
                  placeholder="Ej: 45 min"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="temas">Temas a Tratar</Label>
                <Input
                  id="temas"
                  value={formData.temas}
                  onChange={(e) => setFormData({...formData, temas: e.target.value})}
                  placeholder="Separar con comas"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="resumen">Notas Adicionales</Label>
                <Textarea
                  id="resumen"
                  value={formData.resumen}
                  onChange={(e) => setFormData({...formData, resumen: e.target.value})}
                  placeholder="Información adicional relevante"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Programar Entrevista
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista">Lista de Entrevistas</TabsTrigger>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <div className="grid gap-4">
            {entrevistasPimco.map((entrevista) => (
              <Card key={entrevista.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {entrevista.titulo}
                        {getTipoBadge(entrevista.tipo)}
                        {getEstadoBadge(entrevista.estado)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {entrevista.fecha}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {entrevista.duracion}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isEditing} onOpenChange={setIsEditing}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(entrevista)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border shadow-2xl max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar Entrevista</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-titulo">Título</Label>
                              <Input
                                id="edit-titulo"
                                value={formData.titulo}
                                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-entrevistado">Entrevistado</Label>
                                <Input
                                  id="edit-entrevistado"
                                  value={formData.entrevistado}
                                  onChange={(e) => setFormData({...formData, entrevistado: e.target.value})}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-fecha">Fecha</Label>
                                <Input
                                  id="edit-fecha"
                                  type="date"
                                  value={formData.fecha}
                                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-resumen">Resumen</Label>
                              <Textarea
                                id="edit-resumen"
                                value={formData.resumen}
                                onChange={(e) => setFormData({...formData, resumen: e.target.value})}
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdate}>
                              Actualizar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(entrevista.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Entrevistado:</strong> {entrevista.entrevistado}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Entrevistador:</strong> {entrevista.entrevistador}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Temas Tratados:</h4>
                    <div className="flex flex-wrap gap-1">
                      {entrevista.temas.map((tema, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tema}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {entrevista.resumen && (
                    <div>
                      <h4 className="font-medium mb-2">Resumen:</h4>
                      <p className="text-sm text-muted-foreground">{entrevista.resumen}</p>
                    </div>
                  )}

                  {entrevista.documentos.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Documentos:</h4>
                      <div className="flex flex-wrap gap-2">
                        {entrevista.documentos.map((doc, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">Ver Detalles</Button>
                    {entrevista.estado === 'completada' && (
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Transcripción
                      </Button>
                    )}
                    <Button variant="outline" size="sm">Descargar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Entrevistas</CardTitle>
              <CardDescription>
                Próximas entrevistas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entrevistasPimco
                  .filter(e => e.estado !== 'completada')
                  .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                  .map((entrevista) => (
                    <div key={entrevista.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {new Date(entrevista.fecha).getDate()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entrevista.fecha).toLocaleDateString('es', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{entrevista.titulo}</div>
                          <div className="text-sm text-muted-foreground">
                            {entrevista.entrevistado} • {entrevista.duracion}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTipoBadge(entrevista.tipo)}
                        {getEstadoBadge(entrevista.estado)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entrevistas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{entrevistasPimco.length}</div>
                <p className="text-xs text-muted-foreground">
                  Todas las modalidades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {entrevistasPimco.filter(e => e.estado === 'completada').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((entrevistasPimco.filter(e => e.estado === 'completada').length / entrevistasPimco.length) * 100)}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programadas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {entrevistasPimco.filter(e => e.estado === 'programada').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Próximas semanas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  minutos por entrevista
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tiposEntrevista.map((tipo) => {
                  const count = entrevistasPimco.filter(e => e.tipo === tipo.valor).length
                  const percentage = (count / entrevistasPimco.length) * 100
                  return (
                    <div key={tipo.valor} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{tipo.etiqueta}</span>
                        <span className="text-sm text-muted-foreground">{count} entrevistas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs w-10 text-right">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
