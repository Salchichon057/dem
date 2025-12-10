/* eslint-disable @typescript-eslint/no-explicit-any */
import PublicFormWrapper from '@/components/form/PublicFormWrapper'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPublicForm(slug: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔍 [PUBLIC PAGE] Fetching form by slug:', slug)

    const { data: formWithSections, error: formError } = await supabase
      .from('form_templates')
      .select(`
        id,
        name,
        description,
        slug,
        is_public,
        is_active,
        section_location,
        version,
        created_by,
        created_at,
        updated_at,
        form_sections (
          id,
          title,
          description,
          order_index,
          form_template_id,
          questions (
            id,
            form_template_id,
            section_id,
            question_type_id,
            title,
            help_text,
            is_required,
            order_index,
            config,
            created_at,
            updated_at,
            question_types (
              id,
              code,
              name,
              description
            )
          )
        )
      `)
      .eq('slug', slug)
      .eq('is_public', true)
      .eq('is_active', true)
      .single()

    if (formError || !formWithSections) {
      console.error('❌ [PUBLIC PAGE] Form not found:', formError)
      return null
    }

    console.log('✅ [PUBLIC PAGE] Form found:', formWithSections.name)

    const sections = formWithSections.form_sections || []
    const allQuestions = sections.flatMap((section: any) => 
      (section.questions || []).map((q: any) => ({
        ...q,
        section_id: section.id
      }))
    )

    return {
      id: formWithSections.id,
      slug: formWithSections.slug,
      name: formWithSections.name,
      description: formWithSections.description,
      version: formWithSections.version,
      is_active: formWithSections.is_active,
      is_public: formWithSections.is_public,
      section_location: formWithSections.section_location,
      created_by: formWithSections.created_by,
      created_at: formWithSections.created_at,
      updated_at: formWithSections.updated_at,
      sections: sections.map((section: any) => ({
        id: section.id,
        form_template_id: section.form_template_id,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        created_at: section.created_at,
        questions: section.questions || []
      })),
      questions: allQuestions
    }
  } catch (error) {
    console.error('❌ [PUBLIC PAGE] Error fetching form:', error)
    return null
  }
}

export default async function PublicFormPage({ params }: PageProps) {
  const { slug } = await params
  const form = await getPublicForm(slug)

  if (!form) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Formulario no disponible
          </h1>
          <p className="text-gray-600 mb-6">
            Este formulario no existe, no está disponible públicamente o ha sido desactivado.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
