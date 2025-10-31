'use client'

import { useState, useTransition, Fragment } from 'react'
import Image from 'next/image'
import type { FormTemplateWithQuestions, QuestionWithRelations } from '@/lib/types'
import SuccessModal from './SuccessModal'
import ErrorModal from './ErrorModal'
import ValidationModal from './ValidationModal'

interface FormRendererProps {
  form: FormTemplateWithQuestions
}

export default function FormRenderer({ form }: FormRendererProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isPending, startTransition] = useTransition()
  const [currentSection, setCurrentSection] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Estados para modales
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [missingFields, setMissingFields] = useState<string[]>([])

  // Función para limpiar el formulario
  const resetForm = () => {
    setAnswers({})
    setCurrentSection(0)
    setErrors({})
  }

  // Dividir preguntas por secciones (cada sección es un step)
  const steps = form.questions.reduce<QuestionWithRelations[][]>((acc, question) => {
    // PAGE_BREAK indica inicio de nueva sección
    if (question.question_types?.code === 'PAGE_BREAK') {
      // Agregar el título de la sección al siguiente grupo
      if (acc.length === 0) acc.push([])
      acc.push([])
    } else {
      // Si no hay secciones aún, crear la primera
      if (acc.length === 0) acc.push([])
      // Agregar pregunta al último grupo
      acc[acc.length - 1].push(question)
    }
    return acc
  }, [])

  // Filtrar secciones vacías
  const filteredSteps = steps.filter(step => step.length > 0)
  const currentQuestions = filteredSteps[currentSection] || []
  const totalSections = filteredSteps.length

  // Obtener info de la sección actual
  const currentSectionData = currentQuestions[0]?.form_sections

  // Calcular progreso basado en preguntas respondidas de TODOS los pasos
  const calculateProgress = () => {
    let totalQuestions = 0
    let answeredQuestions = 0

    filteredSteps.forEach((stepQuestions) => {
      stepQuestions.forEach((q) => {
        totalQuestions++
        const answer = answers[q.id]
        
        // Verificar si la pregunta tiene respuesta válida
        if (answer !== undefined && answer !== null && answer !== '' && 
            !(Array.isArray(answer) && answer.length === 0)) {
          answeredQuestions++
        }
      })
    })

    return totalQuestions > 0 
      ? Math.round((answeredQuestions / totalQuestions) * 100) 
      : 0
  }

  const handleAnswerChange = (questionId: string, value: unknown) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    // Limpiar error si existe
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateCurrentSection = () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    currentQuestions.forEach(q => {
      if (q.is_required) {
        const answer = answers[q.id]
        if (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[q.id] = 'Este campo es obligatorio'
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentSection()) {
      setCurrentSection(prev => Math.min(prev + 1, filteredSteps.length - 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCurrentSection()) {
      return
    }

    // Validar todas las preguntas requeridas del formulario
    const allRequiredQuestions = form.questions.filter(q => 
      q.is_required && q.question_types?.code !== 'PAGE_BREAK'
    )
    const missingAnswers = allRequiredQuestions.filter(q => !answers[q.id])

    if (missingAnswers.length > 0) {
      setMissingFields(missingAnswers.map(q => q.title))
      setShowValidationModal(true)
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            form_template_id: form.id,
            answers: Object.fromEntries(
              Object.entries(answers).map(([questionId, answerValue]) => [
                questionId,
                answerValue
              ])
            )
          })
        })

        const result = await response.json()

        if (result.success) {
          setShowSuccessModal(true)
        } else {
          setErrorMessage(result.error || 'Ha ocurrido un error al enviar el formulario')
          setShowErrorModal(true)
        }
      } catch {
        setErrorMessage('Error de conexión. Por favor, intenta de nuevo.')
        setShowErrorModal(true)
      }
    })
  }

  const renderQuestion = (question: QuestionWithRelations) => {
    // Corregido: question_types es un objeto, no un array
    const questionType = question.question_types?.code
    const config = question.config || {}
    const value = answers[question.id]
    const hasError = !!errors[question.id]

    // Clase común para inputs con manejo de errores
    const inputClassName = `w-full border rounded-lg px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
      hasError 
        ? 'border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:ring-[#e6235a] focus:border-[#e6235a]'
    }`

    switch (questionType) {
      case 'TEXT':
        return (
          <input
            type="text"
            required={question.is_required}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            maxLength={config.maxLength || 255}
            className={inputClassName}
            placeholder="Tu respuesta"
          />
        )

      case 'NUMBER':
        return (
          <input
            type="number"
            required={question.is_required}
            value={(value as number) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.valueAsNumber)}
            min={config.min}
            max={config.max}
            step={config.step || 1}
            className={inputClassName}
            placeholder="Ingresa un número"
          />
        )

      case 'EMAIL':
        return (
          <input
            type="email"
            required={question.is_required}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            maxLength={config.maxLength || 255}
            className={inputClassName}
            placeholder="correo@ejemplo.com"
          />
        )

      case 'PHONE':
        return (
          <input
            type="tel"
            required={question.is_required}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            maxLength={config.maxLength || 20}
            className={inputClassName}
            placeholder="+52 123 456 7890"
          />
        )

      case 'URL':
        return (
          <input
            type="url"
            required={question.is_required}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            maxLength={config.maxLength || 500}
            className={inputClassName}
            placeholder="https://ejemplo.com"
          />
        )

      case 'PARAGRAPH_TEXT':
        return (
          <textarea
            required={question.is_required}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            maxLength={config.maxLength || 5000}
            className={inputClassName}
            placeholder="Tu respuesta"
          />
        )

      case 'MULTIPLE_CHOICE':
      case 'RADIO':
        return (
          <div className="space-y-3">
            {config.options?.map((option, idx) => {
              // Manejar tanto strings simples como objetos
              const optionText = typeof option === 'string' ? option : option.text
              const optionValue = typeof option === 'string' ? option : (option.value || option.text)
              
              return (
                <label 
                  key={idx} 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <input
                    type="radio"
                    required={question.is_required}
                    name={question.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mr-3 h-5 w-5 text-[#e6235a] focus:ring-[#e6235a] border-gray-300"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900">
                    {optionText}
                  </span>
                </label>
              )
            })}
          </div>
        )

      case 'CHECKBOX':
        return (
          <div className="space-y-3">
            {config.options?.map((option, idx) => {
              // Manejar tanto strings simples como objetos
              const optionText = typeof option === 'string' ? option : option.text
              const optionValue = typeof option === 'string' ? option : (option.value || option.text)
              const checkedValues = (value as string[]) || []
              const isChecked = checkedValues.includes(optionValue)
              
              return (
                <label 
                  key={idx} 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, optionValue]
                        : checkedValues.filter(v => v !== optionValue)
                      handleAnswerChange(question.id, newValues)
                    }}
                    className="mr-3 h-5 w-5 text-[#e6235a] focus:ring-[#e6235a] border-gray-300 rounded"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900">
                    {optionText}
                  </span>
                </label>
              )
            })}
          </div>
        )

      case 'LIST':
      case 'DROPDOWN':
        return (
          <select
            required={question.is_required}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={inputClassName}
          >
            <option value="">Selecciona una opción</option>
            {config.options?.map((option, idx) => {
              // Manejar tanto strings simples como objetos
              const optionText = typeof option === 'string' ? option : option.text
              const optionValue = typeof option === 'string' ? option : (option.value || option.text)
              
              return (
                <option key={idx} value={optionValue}>
                  {optionText}
                </option>
              )
            })}
          </select>
        )

      case 'DATE':
        return (
          <input
            type="date"
            required={question.is_required}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={inputClassName}
          />
        )

      case 'TIME':
        return (
          <input
            type="time"
            required={question.is_required}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={inputClassName}
          />
        )

      case 'YES_NO':
        return (
          <div className="space-y-3">
            {['Sí', 'No'].map((option, idx) => (
              <label 
                key={idx} 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <input
                  type="radio"
                  required={question.is_required}
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="mr-3 h-5 w-5 text-[#e6235a] focus:ring-[#e6235a] border-gray-300"
                />
                <span className="text-gray-700 group-hover:text-gray-900">
                  {option}
                </span>
              </label>
            ))}
          </div>
        )

      case 'LINEAR_SCALE':
        const minScale = config.min || 0
        const maxScale = config.max || 10
        const scaleValues = Array.from({ length: maxScale - minScale + 1 }, (_, i) => i + minScale)
        
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 px-2">
              <span>{config.minLabel || minScale}</span>
              <span>{config.maxLabel || maxScale}</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {scaleValues.map((scaleVal) => (
                <button
                  key={scaleVal}
                  type="button"
                  onClick={() => handleAnswerChange(question.id, scaleVal)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all font-medium ${
                    value === scaleVal
                      ? 'bg-[#e6235a] text-white border-[#e6235a] shadow-md scale-110'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#e6235a] hover:text-[#e6235a]'
                  }`}
                >
                  {scaleVal}
                </button>
              ))}
            </div>
          </div>
        )

      case 'RATING':
        const minRating = config.min || 1
        const maxRating = config.max || 10
        const ratings = Array.from({ length: maxRating - minRating + 1 }, (_, i) => i + minRating)
        
        return (
          <div className="flex flex-wrap gap-2">
            {ratings.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                  value === rating
                    ? 'bg-[#e6235a] text-white border-[#e6235a] shadow-md scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#e6235a] hover:text-[#e6235a]'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        )

      case 'FILE_UPLOAD':
        return (
          <div>
            <input
              type="file"
              required={question.is_required}
              accept={config.allowedTypes?.join(',') || '*'}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // TODO: Implementar upload a Supabase Storage
                  handleAnswerChange(question.id, file.name)
                }
              }}
              className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#e6235a] file:text-white hover:file:bg-[#c41e4d] file:cursor-pointer transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              {config.allowedTypes?.length 
                ? `Formatos permitidos: ${config.allowedTypes.join(', ')}` 
                : 'Todos los formatos permitidos'}
            </p>
          </div>
        )

      case 'GRID':
        const rows = config.rows || []
        const columns = config.columns || []
        
        return (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    {/* Empty corner cell */}
                  </th>
                  {columns.map((col, idx) => (
                    <th key={idx} className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                      {col.text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700 font-medium">
                      {row.text}
                    </td>
                    {columns.map((col, colIdx) => {
                      const gridValue = (value as Record<string, string>) || {}
                      
                      return (
                        <td key={colIdx} className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="radio"
                            name={`${question.id}-${rowIdx}`}
                            checked={gridValue[row.text] === col.text}
                            onChange={() => {
                              handleAnswerChange(question.id, {
                                ...gridValue,
                                [row.text]: col.text
                              })
                            }}
                            className="h-4 w-4 text-[#e6235a] focus:ring-[#e6235a] border-gray-300"
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'PAGE_BREAK':
        // PAGE_BREAK solo separa secciones, no se renderiza visualmente
        return null

      case 'SECTION_HEADER':
        // SECTION_HEADER es solo visual, no requiere respuesta
        return (
          <div className="bg-gradient-to-r from-[#e6235a]/10 to-transparent border-l-4 border-[#e6235a] p-4 rounded-lg -mt-4">
            <h3 className="text-lg font-bold text-gray-800">{question.title}</h3>
            {question.help_text && (
              <p className="text-sm text-gray-600 mt-1">{question.help_text}</p>
            )}
          </div>
        )

      case 'IMAGE':
        // Mostrar imagen desde URL
        return (
          <div className="flex justify-center">
            {config.imageUrl ? (
              <div className="relative w-full max-w-2xl" style={{ maxHeight: '400px', height: '400px' }}>
                <Image 
                  src={config.imageUrl as string}
                  alt={question.title}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <i className="fas fa-image text-4xl text-gray-400"></i>
                <p className="text-sm text-gray-500 mt-2">No hay imagen configurada</p>
              </div>
            )}
          </div>
        )

      case 'VIDEO':
        // Mostrar video embebido
        return (
          <div className="aspect-video">
            {config.videoUrl ? (
              <iframe
                src={config.videoUrl as string}
                className="w-full h-full rounded-lg shadow-md"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <i className="fas fa-video text-4xl text-gray-400"></i>
                  <p className="text-sm text-gray-500 mt-2">No hay video configurado</p>
                </div>
              </div>
            )}
          </div>
        )

      case 'DROPDOWN_MULTIPLE':
        // Dropdown con selección múltiple (no nativo, usar checkboxes estilizados)
        return (
          <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {config.options?.map((option, idx) => {
                const optionText = typeof option === 'string' ? option : option.text
                const optionValue = typeof option === 'string' ? option : (option.value || option.text)
                const selectedValues = (value as string[]) || []
                const isSelected = selectedValues.includes(optionValue)
                
                return (
                  <label 
                    key={idx} 
                    className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, optionValue]
                          : selectedValues.filter(v => v !== optionValue)
                        handleAnswerChange(question.id, newValues)
                      }}
                      className="mr-3 h-4 w-4 text-[#e6235a] focus:ring-[#e6235a] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{optionText}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Tipo de pregunta no soportado: <strong>{questionType}</strong>
            </p>
          </div>
        )
    }
  }

  const progress = calculateProgress()

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header del formulario */}
      <div className="bg-white rounded-lg shadow-sm border-t-4 border-[#e6235a] p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{form.name}</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
          <i className="far fa-question-circle text-[#e6235a]"></i>
          <span>{form.questions?.filter(q => q.question_types?.code !== 'PAGE_BREAK' && q.question_types?.code !== 'SECTION_HEADER').length || 0} preguntas</span>
        </div>
        {form.description && (
          <p className="text-gray-600">{form.description}</p>
        )}
      </div>

      {/* Progress Bar con Stepper Visual */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        {/* Stepper de secciones */}
        {totalSections > 1 && (
          <div className="mb-6">
            <div className="relative flex items-center justify-between">
              {filteredSteps.map((step, idx) => {
                const sectionInfo = step[0]?.form_sections
                const isActive = idx === currentSection
                const isCompleted = idx < currentSection
                
                return (
                  <Fragment key={idx}>
                    {/* Círculo del step */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        isActive 
                          ? 'bg-[#e6235a] text-white ring-4 ring-[#e6235a]/20 scale-110' 
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <i className="fas fa-check"></i>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      {sectionInfo?.title && (
                        <span className={`text-xs mt-2 text-center font-medium max-w-[100px] truncate ${
                          isActive ? 'text-[#e6235a]' : 'text-gray-500'
                        }`}>
                          {sectionInfo.title}
                        </span>
                      )}
                    </div>
                    
                    {/* Línea conectora entre steps */}
                    {idx < filteredSteps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded transition-all relative ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} style={{ marginBottom: sectionInfo?.title ? '50px' : '0' }}></div>
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Barra de progreso general */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {totalSections > 1 
              ? `Paso ${currentSection + 1} de ${totalSections}` 
              : 'Progreso del formulario'}
          </span>
          <span className="text-sm font-semibold text-[#e6235a]">
            {progress}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-[#e6235a] h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Section title */}
      {currentSectionData && (
        <div className="bg-gradient-to-r from-[#e6235a] to-[#c41e4d] rounded-lg shadow-md p-6 text-white">
          <h3 className="text-xl font-bold mb-2">{currentSectionData.title}</h3>
          {currentSectionData.description && (
            <p className="text-white/90">{currentSectionData.description}</p>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 space-y-8">
        {currentQuestions.map((question, index) => (
          <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-start mb-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#e6235a] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                {index + 1}
              </span>
              <div className="flex-grow">
                <div className={`font-medium text-lg ${errors[question.id] ? 'text-red-600' : 'text-gray-900'}`}>
                  {question.title}
                  {question.is_required && (
                    <span className="text-[#e6235a] ml-1">*</span>
                  )}
                </div>
                {question.help_text && (
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fa-solid fa-circle-info mr-1"></i>
                    {question.help_text}
                  </p>
                )}
                {errors[question.id] && (
                  <p className="text-sm text-red-600 mt-1 font-medium">
                    <i className="fa-solid fa-circle-exclamation mr-1"></i>
                    {errors[question.id]}
                  </p>
                )}
              </div>
            </div>
            <div className="ml-11">
              {renderQuestion(question)}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        {currentSection > 0 ? (
          <button
            type="button"
            onClick={handlePrevious}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Anterior</span>
          </button>
        ) : (
          <div></div>
        )}

        {currentSection < filteredSteps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-[#e6235a] text-white rounded-lg hover:bg-[#c41e4d] transition-colors font-medium ml-auto"
          >
            <span>Siguiente</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center space-x-2 px-8 py-3 bg-[#e6235a] text-white rounded-lg hover:bg-[#c41e4d] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium ml-auto shadow-lg"
          >
            {isPending ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                <span>Enviar Formulario</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Modales */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Tu formulario ha sido enviado exitosamente. Gracias por tu tiempo."
        onRedirect={resetForm}
      />
      
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
      
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        missingFields={missingFields}
      />
    </form>
  )
}
