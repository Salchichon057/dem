import { FormBuilder } from '@/components/form'
import { getFormForEdit } from '@/app/actions/form-builder'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ section?: string }>
}

export default async function EditFormPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const search = await searchParams
  const sectionLocation = search.section

  // Cargar datos del formulario
  const formData = await getFormForEdit(id)

  if (!formData) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-[#e6235a] mb-4"></i>
            <p className="text-gray-600">Cargando editor...</p>
          </div>
        </div>
      }>
        <FormBuilder 
          mode="edit" 
          formId={id}
          sectionLocation={sectionLocation}
          initialData={formData}
        />
      </Suspense>
    </div>
  )
}
