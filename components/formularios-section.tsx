"use client"

import { FormsList } from "@/components/form"
import { FormSectionType } from "@/lib/types"

export function FormulariosSection() {
  return (
    <FormsList 
      sectionLocation={FormSectionType.ORGANIZACIONES} 
      locationName="Organizaciones" 
    />
  )
}
