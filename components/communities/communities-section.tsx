'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, BarChart3 } from 'lucide-react'
import CommunitiesTable from '@/components/communities/communities-table'
import CommunitiesCharts from '@/components/statistics/communities-charts'

type ViewMode = 'table' | 'charts'

interface CommunitiesSectionProps {
  initialView?: ViewMode
}

export default function CommunitiesSection({ initialView = 'table' }: CommunitiesSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunidades</h1>
          <p className="text-muted-foreground">
            Gestión de comunidades beneficiarias del programa
          </p>
        </div>
      </div>

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
        >
          <BarChart3 className="w-5 h-5" />
          Gráficos Resumen
        </Button>
      </div>

      <div className="mt-6">
        {viewMode === 'table' ? (
          <CommunitiesTable />
        ) : (
          <CommunitiesCharts />
        )}
      </div>
    </div>
  )
}
