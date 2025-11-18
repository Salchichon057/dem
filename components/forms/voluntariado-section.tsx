'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, BarChart3, Lock } from 'lucide-react'
import VolunteersTable from '@/components/volunteers/volunteers-table'
import { Card } from '@/components/ui/card'

type ViewMode = 'table' | 'charts'

interface VoluntariadoSectionProps {
  initialView?: ViewMode
}

export default function VoluntariadoSection({ initialView = 'table' }: VoluntariadoSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)

  return (
    <div className="space-y-6">
      {/* Header con título y tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voluntariado</h1>
          <p className="text-muted-foreground">
            Gestión de voluntarios y registro de actividades
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          onClick={() => setViewMode('table')}
          className="gap-2"
        >
          <Table className="w-5 h-5" />
          Tabla de Datos
        </Button>
        <Button
          variant={viewMode === 'charts' ? 'default' : 'ghost'}
          onClick={() => setViewMode('charts')}
          className="gap-2"
          disabled
        >
          <BarChart3 className="w-5 h-5" />
          Gráficos Resumen
          <Lock className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Content based on selected tab */}
      <div className="mt-6">
        {viewMode === 'table' ? (
          <VolunteersTable />
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-purple-100 p-6 rounded-full">
                <Lock className="w-12 h-12 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Gráficos y Estadísticas</h3>
                <p className="text-muted-foreground max-w-md">
                  Esta sección estará disponible próximamente. Estamos trabajando en definir 
                  los mejores indicadores y gráficos para visualizar los datos de voluntariado.
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
