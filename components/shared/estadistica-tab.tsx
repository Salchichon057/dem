'use client'

import { useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, BarChart3, Lock } from 'lucide-react'

type EstadisticaView = 'tabla' | 'graficos'

interface EstadisticaTabProps {
  tablaContent: ReactNode
  graficosContent?: ReactNode
  graficosDisabled?: boolean
  defaultView?: EstadisticaView
}

export default function EstadisticaTab({
  tablaContent,
  graficosContent,
  graficosDisabled = false,
  defaultView = 'tabla'
}: EstadisticaTabProps) {
  const [viewMode, setViewMode] = useState<EstadisticaView>(defaultView)

  return (
    <div className="space-y-4">
      {/* Sub-tabs para Estadística */}
      <div className="flex gap-2 border-b border-gray-200">
        <Button
          variant={viewMode === 'tabla' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('tabla')}
          className={`gap-2 ${
            viewMode === 'tabla'
              ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white'
              : 'hover:bg-purple-50'
          }`}
        >
          <Table className="w-4 h-4" />
          Tabla de Datos
        </Button>
        <Button
          variant={viewMode === 'graficos' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('graficos')}
          disabled={graficosDisabled}
          className={`gap-2 ${
            viewMode === 'graficos'
              ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white'
              : 'hover:bg-purple-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Gráficos Resumen
          {graficosDisabled && <Lock className="w-3 h-3 ml-1" />}
        </Button>
      </div>

      {/* Contenido */}
      <div>
        {viewMode === 'tabla' ? (
          tablaContent
        ) : graficosContent ? (
          graficosContent
        ) : (
          <Card className="p-12 text-center border-purple-200 bg-linear-to-br from-purple-50/50 to-blue-50/50">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-linear-to-br from-purple-100 to-blue-100 p-6 rounded-full">
                <Lock className="w-12 h-12 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Gráficos y Estadísticas
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Esta sección estará disponible próximamente. Estamos trabajando en definir 
                  los mejores indicadores y gráficos para visualizar los datos.
                </p>
              </div>
              <Button variant="outline" disabled className="mt-4">
                Próximamente
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

