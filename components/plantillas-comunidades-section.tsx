"use client"

import { FormsList } from "@/components/form"
import { FormSectionType } from "@/lib/types"

export function PlantillasComunidadesSection() {
  return (
    <FormsList 
      sectionLocation={FormSectionType.COMUNIDADES} 
      locationName="Plantillas de Comunidades" 
    />
  )
}
