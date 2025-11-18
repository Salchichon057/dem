'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, BarChart3 } from 'lucide-react'
import BeneficiariesTable from '@/components/beneficiaries/beneficiaries-table'
import BeneficiariesCharts from '@/components/beneficiaries/beneficiaries-charts'

type ViewMode = 'table' | 'charts'

interface AbrazandoLeyendasSectionProps {
  initialView?: ViewMode
}

export default function AbrazandoLeyendasSection({ initialView = 'table' }: AbrazandoLeyendasSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)

  return (
    <div className="space-y-6">
      {/* Header con título y tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Abrazando Leyendas</h1>
          <p className="text-muted-foreground">
            Gestión de beneficiarios del programa
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
        >
          <BarChart3 className="w-5 h-5" />
          Gráficos Resumen
        </Button>
      </div>

      {/* Content based on selected tab */}
      <div className="mt-6">
        {viewMode === 'table' ? (
          <BeneficiariesTable />
        ) : (
          <BeneficiariesCharts />
        )}
      </div>
    </div>
  )
}
