"use client"

import { FormsList } from "@/components/form"
import { FormSectionType } from "@/lib/types"

export function FormulariosAuditoriaSection() {
  return (
    <FormsList 
      sectionLocation={FormSectionType.AUDITORIAS} 
      locationName="Auditorías" 
    />
  )
}
