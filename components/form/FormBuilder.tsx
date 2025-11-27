/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  PlusCircle, 
  Layers, 
  ArrowLeft, 
  Loader2, 
  Save,
  Edit,
  FileText,
  Copy
} from 'lucide-react'
import QuestionTypeSelector from './QuestionTypeSelector'
import QuestionEditor from './QuestionEditor'
import Modal from '@/components/ui/Modal'
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
  onSuccess?: () => void // ← Callback para cuando se guarda exitosamente
  onCancel?: () => void // ← Callback para cuando se cancela
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

export default function FormBuilder({ mode = 'create', formId, sectionLocation, onSuccess, onCancel, initialData }: FormBuilderProps) {
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

  // Cargar datos del formulario desde la API si estamos en modo edición con formId
  useEffect(() => {
    async function loadFormData() {
      if (mode === 'edit' && formId && !initialData) {
        try {
          const userId = '4157e293-5629-4369-bcdb-5a0197596e3c' // ID del admin hardcoded
          const response = await fetch(`/api/formularios/${formId}?userId=${userId}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error ${response.status}: ${errorText}`)
          }
          
          const result = await response.json()
          
          if (result.success && result.data) {
            const form = result.data
            
            // Cargar datos básicos del formulario
            setFormName(form.name || '')
            setFormDescription(form.description || '')
            setFormSlug(form.slug || '')
            setIsPublic(form.is_public ?? true)
            
            // Cargar secciones y preguntas
            if (form.sections && form.sections.length > 0) {
              const convertedSections: BuilderSection[] = form.sections.map((section: any) => ({
                tempId: `section-${section.id}`,
                title: section.title || '',
                description: section.description || '',
                order_index: section.order_index || 0,
                questions: (section.questions || []).map((q: any) => ({
                  tempId: `question-${q.id}`,
                  title: q.title || '',
                  help_text: q.help_text || '',
                  is_required: q.is_required ?? false,
                  order_index: q.order_index || 0,
                  question_type_id: q.question_type_id,
                  question_type_code: q.question_types?.code || '',
                  config: q.config || {}
                }))
              }))
              setSections(convertedSections)
            }
          }
        } catch (error) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'No se pudo cargar el formulario. Por favor, intenta nuevamente.'
          })
        }
      }
    }
    loadFormData()
  }, [mode, formId, initialData])

  // Cargar datos iniciales si estamos en modo edición con initialData
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
      try {
        const response = await fetch('/api/question-types')
        const result = await response.json()
        if (result.success && result.data) {
          setQuestionTypes(result.data)
        }
      } catch (error) {
      }
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

  // Duplicar sección
  const handleDuplicateSection = (sectionTempId: string) => {
    const sectionToDuplicate = sections.find(s => s.tempId === sectionTempId)
    if (!sectionToDuplicate) return

    const newSection: BuilderSection = {
      tempId: `section-${Date.now()}`,
      title: `${sectionToDuplicate.title} (Copia)`,
      description: sectionToDuplicate.description,
      order_index: sections.length,
      questions: sectionToDuplicate.questions.map((q, idx) => ({
        ...q,
        tempId: `question-${Date.now()}-${idx}`,
        order_index: idx
      }))
    }

    setSections([...sections, newSection])
    
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Sección Duplicada',
      message: `La sección "${sectionToDuplicate.title}" ha sido duplicada exitosamente.`
    })
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

  // Duplicar pregunta
  const handleDuplicateQuestion = (sectionTempId: string, questionTempId: string) => {
    setSections(sections.map(s => {
      if (s.tempId === sectionTempId) {
        const questionIndex = s.questions.findIndex(q => q.tempId === questionTempId)
        if (questionIndex === -1) return s

        const questionToDuplicate = s.questions[questionIndex]
        const newQuestion: BuilderQuestion = {
          ...questionToDuplicate,
          tempId: `question-${Date.now()}`,
          title: `${questionToDuplicate.title} (Copia)`,
          order_index: 0 // Se recalculará después
        }

        const updatedQuestions = [
          ...s.questions.slice(0, questionIndex + 1),
          newQuestion,
          ...s.questions.slice(questionIndex + 1)
        ]
        
        // Recalcular order_index
        updatedQuestions.forEach((q, idx) => q.order_index = idx)
        
        return { ...s, questions: updatedQuestions }
      }
      return s
    }))
    
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Pregunta Duplicada',
      message: 'La pregunta ha sido duplicada exitosamente.'
    })
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
        const response = await fetch(`/api/formularios/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Error al actualizar: ${errorText}`)
        }
        
        result = await response.json()
      } else {
        const response = await fetch('/api/formularios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        result = await response.json()
      }
      
      if (result.success) {
        setModal({
          isOpen: true,
          type: 'success',
          title: mode === 'edit' ? '¡Formulario Actualizado!' : '¡Formulario Creado!',
          message: `El formulario "${formName}" ha sido ${mode === 'edit' ? 'actualizado' : 'creado'} exitosamente.`,
          onConfirm: () => {
            if (onSuccess) {
              onSuccess() // Usar callback si existe
            } else {
              router.back() // Fallback al comportamiento anterior
            }
          }
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            {mode === 'edit' ? (
              <Edit className="w-8 h-8 text-purple-600 mr-3" />
            ) : (
              <FileText className="w-8 h-8 text-purple-600 mr-3" />
            )}
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
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
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
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
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
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 font-mono text-sm"
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
                className="h-5 w-5 text-purple-600 focus:ring-purple-600 border-gray-300 rounded"
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
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      {sectionIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateSection(section.tempId, 'title', e.target.value)}
                      placeholder="Título de la sección *"
                      className="flex-1 text-xl font-bold border-b-2 border-gray-300 focus:border-purple-600 outline-none pb-1"
                    />
                  </div>
                  <input
                    type="text"
                    value={section.description || ''}
                    onChange={(e) => handleUpdateSection(section.tempId, 'description', e.target.value)}
                    placeholder="Descripción de la sección (opcional)"
                    className="w-full text-sm text-gray-600 border-b border-gray-200 focus:border-purple-600 outline-none pb-1"
                  />
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDuplicateSection(section.tempId)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    title="Duplicar sección"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.tempId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Eliminar sección"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
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
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded transition-colors"
                              title="Mover arriba"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Mover abajo */}
                          {questionIndex < section.questions.length - 1 && (
                            <button
                              onClick={() => handleMoveQuestion(section.tempId, question.tempId, 'down')}
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded transition-colors"
                              title="Mover abajo"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Duplicar */}
                          <button
                            onClick={() => handleDuplicateQuestion(section.tempId, question.tempId)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-colors"
                            title="Duplicar pregunta"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          {/* Eliminar */}
                          <button
                            onClick={() => handleDeleteQuestion(section.tempId, question.tempId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                            title="Eliminar pregunta"
                          >
                            <X className="w-4 h-4" />
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
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Agregar Pregunta
                </button>
              </div>
            </div>
          ))}

          {/* Botón agregar sección */}
          <button
            onClick={handleAddSection}
            className="w-full border-2 border-dashed border-gray-400 rounded-lg p-6 text-gray-600 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 transition-colors font-medium text-lg flex items-center justify-center"
          >
            <Layers className="w-6 h-6 mr-2" />
            Agregar Sección
          </button>
        </div>

        {/* Footer con botones de acción */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6 flex justify-between items-center">
          <button
            onClick={() => {
              if (onCancel) {
                onCancel()
              } else {
                router.back()
              }
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Cancelar
          </button>

          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="px-8 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
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
