/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormRenderer } from '@/components/form'
import { createClient } from '@/lib/supabase/server'
import { FormTemplateWithQuestions } from '@/lib/types'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewFormPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener el formulario con sus preguntas
  const { data: form, error } = await supabase
    .from('form_templates')
    .select(`
      *,
      questions:form_questions(
        *,
        question_types(*),
        form_sections(*),
        options:question_options(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !form) {
    redirect('/dashboard')
  }

  // Ordenar preguntas por order_index
  const formWithSortedQuestions: FormTemplateWithQuestions = {
    ...form,
    questions: form.questions.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {form.name}
            </h1>
            {form.description && (
              <p className="text-gray-600">
                {form.description}
              </p>
            )}
          </div>
        </div>

        {/* Formulario */}
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
              <p className="text-gray-600">Cargando formulario...</p>
            </div>
          </div>
        }>
          <FormRenderer form={formWithSortedQuestions} />
        </Suspense>
      </div>
    </div>
  )
}
