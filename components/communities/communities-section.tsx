'use client'

import CommunitiesTable from '@/components/communities/communities-table'

/**
 * Sección principal de Comunidades
 * Sin formularios dinámicos - Los datos van directamente a la tabla communities
 */
export default function CommunitiesSection() {
  return (
    <div className="space-y-6">
      {/* Header con título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunidades</h1>
          <p className="text-muted-foreground">
            Gestión de comunidades beneficiarias del programa
          </p>
        </div>
      </div>

      {/* Tabla de datos */}
      <CommunitiesTable />
    </div>
  )
}
