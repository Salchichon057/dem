/* eslint-disable @typescript-eslint/no-explicit-any */
import PublicFormWrapper from '@/components/form/PublicFormWrapper'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPublicForm(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/public/forms/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    // La API ya devuelve el form directamente (no wrapeado en { form: ... })
    const formData = await response.json()
    return formData
  } catch (error) {
    console.error('Error fetching public form:', error)
    return null
  }
}

export default async function PublicFormPage({ params }: PageProps) {
  const { slug } = await params
  const form = await getPublicForm(slug)

  if (!form) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formulario no encontrado</h1>
          <p className="text-gray-600 mb-6">
            Este formulario no existe o no está disponible públicamente.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const formWithSortedQuestions = {
    ...form,
    questions: form.questions.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-gray-600 mb-4">
            <span className="text-sm">Formulario público</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {form.name}
            </h1>
            {form.description && (
              <p className="text-gray-600">
                {form.description}
              </p>
            )}
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        }>
          <PublicFormWrapper 
            form={formWithSortedQuestions} 
            slug={slug}
          />
        </Suspense>
      </div>
    </div>
  )
}
