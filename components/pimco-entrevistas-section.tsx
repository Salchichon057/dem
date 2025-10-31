"use client"

import { FormsList } from "@/components/form"
import { FormSectionType } from "@/lib/types"

export function PIMCOEntrevistasSection() {
  return (
    <FormsList 
      sectionLocation={FormSectionType.PERFIL_COMUNITARIO} 
      locationName="Entrevistas PIMCO" 
    />
  )
}
