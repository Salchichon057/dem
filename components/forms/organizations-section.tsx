'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, BarChart3 } from 'lucide-react'
import DynamicFormSubmissionsTable from '@/components/forms/dynamic-form-submissions-table'
import OrganizationsCharts from '@/components/statistics/organizations-charts'

type ViewMode = 'table' | 'charts'

export default function OrganizationsSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {selectedFormId && selectedFormId !== 'none' && (
        <div className="flex gap-2 border-b">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            onClick={() => setViewMode('table')}
            className="gap-2 text-sm"
          >
            <Table className="w-4 h-4" />
            Datos
          </Button>
          <Button
            variant={viewMode === 'charts' ? 'default' : 'ghost'}
            onClick={() => setViewMode('charts')}
            className="gap-2 text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </Button>
        </div>
      )}

      {viewMode === 'table' ? (
        <DynamicFormSubmissionsTable
          sectionLocation="organizaciones"
          sectionTitle="Organizaciones"
          onFormSelect={setSelectedFormId}
        />
      ) : selectedFormId && selectedFormId !== 'none' ? (
        <OrganizationsCharts formId={selectedFormId} />
      ) : (
        <div className="flex items-center justify-center min-h-[400px] text-gray-500">
          Selecciona un formulario para ver las estadísticas
        </div>
      )}
    </div>
  )
}
