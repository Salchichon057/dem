/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QuestionTypeSelector from './QuestionTypeSelector'
import QuestionEditor from './QuestionEditor'
import Modal from '@/components/ui/Modal'
import { getQuestionTypes, createFormWithSections, updateFormWithSections } from '@/app/actions/form-builder'
import type { QuestionType } from '@/lib/types'

interface BuilderQuestion {
  tempId: string // ID temporal mientras se construye
  title: string
  help_text?: string
  is_required: boolean
  order_index: number
  question_type_id: string
  question_type_code: string
  config: Record<string, any>
}

interface BuilderSection {
  tempId: string // ID temporal mientras se construye
  title: string
  description?: string
  order_index: number
  questions: BuilderQuestion[]
}

interface FormBuilderProps {
  mode?: 'create' | 'edit'
  formId?: string  // UUID, no number
  sectionLocation?: string // ← NUEVO: 'organizaciones', 'auditorias', 'entrevistas', etc.
  initialData?: {
    name: string
    description?: string
    slug: string
    is_public: boolean
    section_location?: string | null
    sections: Array<{
      id: number
      title: string
      description?: string
      order_index: number
      questions: Array<{
        id: number
        question_type_id: string
        title: string
        help_text?: string
        is_required: boolean
        order_index: number
        config: Record<string, any>
        question_types: {
          id: string
          code: string
          name: string
        }
      }>
    }>
  }
}

export default function FormBuilder({ mode = 'create', formId, sectionLocation, initialData }: FormBuilderProps) {
  const router = useRouter()
  const [formName, setFormName] = useState(initialData?.name || '')
  const [formDescription, setFormDescription] = useState(initialData?.description || '')
  const [formSlug, setFormSlug] = useState(initialData?.slug || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true)
  
  const [sections, setSections] = useState<BuilderSection[]>([])
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([])
  
  const [isSaving, setIsSaving] = useState(false)
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] = useState(false)
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)

  // Estado para el modal
  const [modal, setModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm'
    title: string
    message: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const convertedSections: BuilderSection[] = initialData.sections.map(section => ({
        tempId: `section-${section.id}`,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        questions: section.questions.map(q => ({
          tempId: `question-${q.id}`,
          title: q.title,
          help_text: q.help_text,
          is_required: q.is_required,
          order_index: q.order_index,
          question_type_id: q.question_type_id,
          question_type_code: q.question_types.code,
          config: q.config
        }))
      }))
      setSections(convertedSections)
    }
  }, [mode, initialData])

  // Cargar tipos de pregunta al montar
  useEffect(() => {
    async function loadQuestionTypes() {
      const types = await getQuestionTypes()
      setQuestionTypes(types)
    }
    loadQuestionTypes()
  }, [])

  // Auto-generar slug desde el nombre (solo en modo create)
  useEffect(() => {
    if (mode === 'create' && formName) {
      const slug = formName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
        .trim()
        .replace(/\s+/g, '-') // Espacios → guiones
        .replace(/-+/g, '-') // Múltiples guiones → uno solo
      setFormSlug(slug)
    }
  }, [formName, mode])

  // Agregar nueva sección
  const handleAddSection = () => {
    const newSection: BuilderSection = {
      tempId: `section-${Date.now()}`,
      title: '',
      description: '',
      order_index: sections.length,
      questions: []
    }
    setSections([...sections, newSection])
  }

  // Eliminar sección
  const handleDeleteSection = (sectionTempId: string) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: '¿Eliminar Sección?',
      message: 'Se eliminará esta sección y todas sus preguntas. Esta acción no se puede deshacer.',
      onConfirm: () => {
        setSections(sections.filter(s => s.tempId !== sectionTempId))
        setModal({ ...modal, isOpen: false })
      }
    })
  }

  // Actualizar sección
  const handleUpdateSection = (sectionTempId: string, field: string, value: string) => {
    setSections(sections.map(s => 
      s.tempId === sectionTempId ? { ...s, [field]: value } : s
    ))
  }

  // Abrir selector de tipo de pregunta
  const handleAddQuestion = (sectionTempId: string) => {
    setCurrentSectionId(sectionTempId)
    setShowQuestionTypeSelector(true)
  }

  // Agregar pregunta después de seleccionar tipo
  const handleQuestionTypeSelected = (typeId: string, typeCode: string) => {
    if (!currentSectionId) return

    const newQuestion: BuilderQuestion = {
      tempId: `question-${Date.now()}`,
      title: '',
      help_text: '',
      is_required: false,
      order_index: 0, // Se calculará después
      question_type_id: typeId,
      question_type_code: typeCode,
      config: {}
    }

    setSections(sections.map(s => {
      if (s.tempId === currentSectionId) {
        const updatedQuestions = [...s.questions, newQuestion]
        // Recalcular order_index
        updatedQuestions.forEach((q, idx) => q.order_index = idx)
        return { ...s, questions: updatedQuestions }
      }
      return s
    }))

    setShowQuestionTypeSelector(false)
    setCurrentSectionId(null)
  }

  // Eliminar pregunta
  const handleDeleteQuestion = (sectionTempId: string, questionTempId: string) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: '¿Eliminar Pregunta?',
      message: 'Esta pregunta será eliminada permanentemente.',
      onConfirm: () => {
        setSections(sections.map(s => {
          if (s.tempId === sectionTempId) {
            const updatedQuestions = s.questions.filter(q => q.tempId !== questionTempId)
            // Recalcular order_index
            updatedQuestions.forEach((q, idx) => q.order_index = idx)
            return { ...s, questions: updatedQuestions }
          }
          return s
        }))
        setModal({ ...modal, isOpen: false })
      }
    })
  }

  // Actualizar pregunta
  const handleUpdateQuestion = (
    sectionTempId: string,
    questionTempId: string,
    updates: Partial<BuilderQuestion>
  ) => {
    setSections(sections.map(s => {
      if (s.tempId === sectionTempId) {
        return {
          ...s,
          questions: s.questions.map(q =>
            q.tempId === questionTempId ? { ...q, ...updates } : q
          )
        }
      }
      return s
    }))
  }

  // Mover pregunta arriba/abajo
  const handleMoveQuestion = (sectionTempId: string, questionTempId: string, direction: 'up' | 'down') => {
    setSections(sections.map(s => {
      if (s.tempId === sectionTempId) {
        const currentIndex = s.questions.findIndex(q => q.tempId === questionTempId)
        if (currentIndex === -1) return s

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        if (newIndex < 0 || newIndex >= s.questions.length) return s

        const newQuestions = [...s.questions]
        const [removed] = newQuestions.splice(currentIndex, 1)
        newQuestions.splice(newIndex, 0, removed)
        
        // Recalcular order_index
        newQuestions.forEach((q, idx) => q.order_index = idx)
        
        return { ...s, questions: newQuestions }
      }
      return s
    }))
  }

  // Validar formulario antes de guardar
  const validateForm = (): string | null => {
    if (!formName.trim()) return 'El nombre del formulario es requerido'
    if (!formSlug.trim()) return 'El slug es requerido'
    if (sections.length === 0) return 'Debe agregar al menos una sección'

    for (const section of sections) {
      if (!section.title.trim()) return 'Todas las secciones deben tener título'
      if (section.questions.length === 0) return `La sección "${section.title}" debe tener al menos una pregunta`
      
      for (const question of section.questions) {
        if (!question.title.trim()) return `Pregunta sin título en sección "${section.title}"`
      }
    }

    return null
  }

  // Guardar formulario en base de datos
  const handleSaveForm = async () => {
    const error = validateForm()
    if (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error de Validación',
        message: error
      })
      return
    }

    setIsSaving(true)
    try {
      // Calcular order_index global para las preguntas
      let globalQuestionIndex = 0
      
      const formData = {
        name: formName,
        description: formDescription,
        slug: formSlug,
        is_public: isPublic,
        section_location: sectionLocation as any, // Cast temporal para compatibilidad
        sections: sections.map(s => ({
          title: s.title,
          description: s.description || null,
          order_index: s.order_index,
          questions: s.questions.map(q => ({
            title: q.title,
            help_text: q.help_text || null,
            is_required: q.is_required,
            order_index: globalQuestionIndex++, // Incrementar globalmente
            question_type_id: q.question_type_id,
            config: q.config
          }))
        }))
      }

      let result
      if (mode === 'edit' && formId) {
        result = await updateFormWithSections(formId, formData, sectionLocation)
      } else {
        result = await createFormWithSections(formData, sectionLocation)
      }
      
      if (result.success) {
        setModal({
          isOpen: true,
          type: 'success',
          title: mode === 'edit' ? '¡Formulario Actualizado!' : '¡Formulario Creado!',
          message: `El formulario "${formName}" ha sido ${mode === 'edit' ? 'actualizado' : 'creado'} exitosamente.`,
          onConfirm: () => router.back()
        })
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Error al Guardar',
          message: result.message
        })
      }
    } catch {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error Inesperado',
        message: 'Ocurrió un error al guardar el formulario. Por favor, intenta nuevamente.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            <i className={`fa-solid ${mode === 'edit' ? 'fa-edit' : 'fa-plus-circle'} text-[#e6235a] mr-3`}></i>
            {mode === 'edit' ? 'Editar Formulario' : 'Crear Nuevo Formulario'}
          </h1>

          {/* Información básica del formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Formulario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Auditoría de Comunidades 2025"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#e6235a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descripción breve del formulario..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#e6235a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL amigable) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="auditoria-comunidades-2025"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#e6235a] focus:border-transparent font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: <span className="font-mono">/forms/{formSlug || 'slug-del-formulario'}</span>
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-5 w-5 text-[#e6235a] focus:ring-[#e6235a] border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-3 text-sm font-medium text-gray-700">
                Formulario público (visible sin autenticación)
              </label>
            </div>
          </div>
        </div>

        {/* Secciones */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.tempId} className="bg-white rounded-lg shadow-md p-6">
              {/* Header de sección */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="bg-[#e6235a] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      {sectionIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateSection(section.tempId, 'title', e.target.value)}
                      placeholder="Título de la sección *"
                      className="flex-1 text-xl font-bold border-b-2 border-gray-300 focus:border-[#e6235a] outline-none pb-1"
                    />
                  </div>
                  <input
                    type="text"
                    value={section.description || ''}
                    onChange={(e) => handleUpdateSection(section.tempId, 'description', e.target.value)}
                    placeholder="Descripción de la sección (opcional)"
                    className="w-full text-sm text-gray-600 border-b border-gray-200 focus:border-[#e6235a] outline-none pb-1"
                  />
                </div>
                
                <button
                  onClick={() => handleDeleteSection(section.tempId)}
                  className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Eliminar sección"
                >
                  <i className="fa-solid fa-trash text-lg"></i>
                </button>
              </div>

              {/* Preguntas de la sección */}
              <div className="space-y-4 ml-11">
                {section.questions.map((question, questionIndex) => {
                  const questionType = questionTypes.find(qt => qt.id === question.question_type_id)
                  
                  return (
                    <div key={question.tempId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {/* Header de pregunta */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="bg-gray-300 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                            {questionIndex + 1}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                            {questionType?.name || 'Tipo desconocido'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Mover arriba */}
                          {questionIndex > 0 && (
                            <button
                              onClick={() => handleMoveQuestion(section.tempId, question.tempId, 'up')}
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"
                              title="Mover arriba"
                            >
                              <i className="fa-solid fa-arrow-up text-sm"></i>
                            </button>
                          )}
                          
                          {/* Mover abajo */}
                          {questionIndex < section.questions.length - 1 && (
                            <button
                              onClick={() => handleMoveQuestion(section.tempId, question.tempId, 'down')}
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"
                              title="Mover abajo"
                            >
                              <i className="fa-solid fa-arrow-down text-sm"></i>
                            </button>
                          )}
                          
                          {/* Eliminar */}
                          <button
                            onClick={() => handleDeleteQuestion(section.tempId, question.tempId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Eliminar pregunta"
                          >
                            <i className="fa-solid fa-times text-sm"></i>
                          </button>
                        </div>
                      </div>

                      {/* Editor de pregunta */}
                      <QuestionEditor
                        question={question}
                        questionType={questionType}
                        onUpdate={(updates) => handleUpdateQuestion(section.tempId, question.tempId, updates)}
                      />
                    </div>
                  )
                })}

                {/* Botón agregar pregunta */}
                <button
                  onClick={() => handleAddQuestion(section.tempId)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-[#e6235a] hover:text-[#e6235a] hover:bg-pink-50 transition-colors"
                >
                  <i className="fa-solid fa-plus-circle mr-2"></i>
                  Agregar Pregunta
                </button>
              </div>
            </div>
          ))}

          {/* Botón agregar sección */}
          <button
            onClick={handleAddSection}
            className="w-full border-2 border-dashed border-gray-400 rounded-lg p-6 text-gray-600 hover:border-[#e6235a] hover:text-[#e6235a] hover:bg-pink-50 transition-colors font-medium text-lg"
          >
            <i className="fa-solid fa-layer-group mr-2"></i>
            Agregar Sección
          </button>
        </div>

        {/* Footer con botones de acción */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Cancelar
          </button>

          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="px-8 py-3 bg-[#e6235a] text-white rounded-lg hover:bg-[#c41e4d] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Guardando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-save mr-2"></i>
                {mode === 'edit' ? 'Actualizar Formulario' : 'Guardar Formulario'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de selector de tipo de pregunta */}
      {showQuestionTypeSelector && (
        <QuestionTypeSelector
          questionTypes={questionTypes}
          onSelect={handleQuestionTypeSelected}
          onClose={() => {
            setShowQuestionTypeSelector(false)
            setCurrentSectionId(null)
          }}
        />
      )}

      {/* Modal de notificaciones */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
      />
    </div>
  )
}
