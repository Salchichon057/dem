import { FormBuilder } from '@/components/form'
import { Suspense } from 'react'

interface PageProps {
  searchParams: Promise<{ section?: string }>
}

export default async function NewFormPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sectionLocation = params.section

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
          mode="create" 
          sectionLocation={sectionLocation} 
        />
      </Suspense>
    </div>
  )
}
