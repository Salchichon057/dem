"use client"

import DynamicFormSubmissionsTable from "@/components/forms/dynamic-form-submissions-table"

export function OrganizacionesEstadisticaSection() {
  return (
    <DynamicFormSubmissionsTable
      sectionLocation="organizaciones"
      sectionTitle="Organizaciones"
    />
  )
}
