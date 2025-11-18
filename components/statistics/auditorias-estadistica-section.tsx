"use client"

import DynamicFormSubmissionsTable from "@/components/forms/dynamic-form-submissions-table"

export function AuditoriasEstadisticaSection() {
  return (
    <DynamicFormSubmissionsTable
      sectionLocation="auditorias"
      sectionTitle="Auditorías"
    />
  )
}
