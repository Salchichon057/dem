'use client'

import type { QuestionType } from '@/lib/types'

interface BuilderQuestion {
  tempId: string
  title: string
  help_text?: string
  is_required: boolean
  order_index: number
  question_type_id: string
  question_type_code: string
  config: Record<string, unknown>
}

interface QuestionEditorProps {
  question: BuilderQuestion
  questionType?: QuestionType
  onUpdate: (updates: Partial<BuilderQuestion>) => void
}

export default function QuestionEditor({ question, questionType, onUpdate }: QuestionEditorProps) {
  const handleConfigUpdate = (key: string, value: unknown) => {
    onUpdate({
      config: {
        ...question.config,
        [key]: value
      }
    })
  }

  const handleAddOption = () => {
    const currentOptions = (question.config.options as string[]) || []
    handleConfigUpdate('options', [...currentOptions, ''])
  }

  const handleUpdateOption = (index: number, value: string) => {
    const currentOptions = [...((question.config.options as string[]) || [])]
    currentOptions[index] = value
    handleConfigUpdate('options', currentOptions)
  }

  const handleDeleteOption = (index: number) => {
    const currentOptions = [...((question.config.options as string[]) || [])]
    currentOptions.splice(index, 1)
    handleConfigUpdate('options', currentOptions)
  }

  const renderConfigEditor = () => {
    const code = questionType?.code

    switch (code) {
      // Tipos que necesitan opciones
      case 'MULTIPLE_CHOICE':
      case 'RADIO':
      case 'CHECKBOX':
      case 'LIST':
      case 'DROPDOWN':
      case 'DROPDOWN_MULTIPLE':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Opciones</label>
            {((question.config.options as string[]) || []).map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  placeholder={`Opción ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
                />
                <button
                  onClick={() => handleDeleteOption(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                >
                  <i className="fa-solid fa-trash text-sm"></i>
                </button>
              </div>
            ))}
            <button
              onClick={handleAddOption}
              className="text-[purple-600] hover:text-[purple-700] text-sm font-medium"
            >
              <i className="fa-solid fa-plus-circle mr-1"></i>
              Agregar opción
            </button>
          </div>
        )

      // Tipo número con min/max/step
      case 'NUMBER':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
              <input
                type="number"
                value={(question.config.min as number) ?? ''}
                onChange={(e) => handleConfigUpdate('min', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Sin límite"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máximo</label>
              <input
                type="number"
                value={(question.config.max as number) ?? ''}
                onChange={(e) => handleConfigUpdate('max', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Sin límite"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paso</label>
              <input
                type="number"
                value={(question.config.step as number) ?? 1}
                onChange={(e) => handleConfigUpdate('step', parseFloat(e.target.value) || 1)}
                placeholder="1"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
              />
            </div>
          </div>
        )

      // Tipo texto con maxLength
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
      case 'URL':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud máxima (caracteres)
            </label>
            <input
              type="number"
              value={(question.config.maxLength as number) ?? ''}
              onChange={(e) => handleConfigUpdate('maxLength', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Sin límite"
              min="1"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
            />
          </div>
        )

      // Tipo párrafo con maxLength
      case 'PARAGRAPH_TEXT':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud máxima (caracteres)
            </label>
            <input
              type="number"
              value={(question.config.maxLength as number) ?? 5000}
              onChange={(e) => handleConfigUpdate('maxLength', parseInt(e.target.value) || 5000)}
              placeholder="5000"
              min="1"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
            />
          </div>
        )

      // Escala lineal
      case 'LINEAR_SCALE':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor mínimo</label>
              <input
                type="number"
                value={(question.config.min as number) ?? 0}
                onChange={(e) => handleConfigUpdate('min', parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
              />
              <input
                type="text"
                value={(question.config.minLabel as string) ?? ''}
                onChange={(e) => handleConfigUpdate('minLabel', e.target.value)}
                placeholder="Etiqueta mínima"
                className="w-full border border-gray-300 rounded px-3 py-2 mt-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor máximo</label>
              <input
                type="number"
                value={(question.config.max as number) ?? 10}
                onChange={(e) => handleConfigUpdate('max', parseInt(e.target.value) || 10)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
              />
              <input
                type="text"
                value={(question.config.maxLabel as string) ?? ''}
                onChange={(e) => handleConfigUpdate('maxLabel', e.target.value)}
                placeholder="Etiqueta máxima"
                className="w-full border border-gray-300 rounded px-3 py-2 mt-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
              />
            </div>
          </div>
        )

      // Imagen
      case 'IMAGE':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen</label>
            <input
              type="url"
              value={(question.config.imageUrl as string) ?? ''}
              onChange={(e) => handleConfigUpdate('imageUrl', e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
            />
          </div>
        )

      // Video
      case 'VIDEO':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del video</label>
            <input
              type="url"
              value={(question.config.videoUrl as string) ?? ''}
              onChange={(e) => handleConfigUpdate('videoUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Soporta YouTube, Vimeo y URLs directas de video
            </p>
          </div>
        )

      // File upload
      case 'FILE_UPLOAD':
        const fileTypeOptions = [
          { value: '.pdf', label: 'PDF (.pdf)' },
          { value: '.doc', label: 'Word (.doc)' },
          { value: '.docx', label: 'Word (.docx)' },
          { value: '.xls', label: 'Excel (.xls)' },
          { value: '.xlsx', label: 'Excel (.xlsx)' },
          { value: '.ppt', label: 'PowerPoint (.ppt)' },
          { value: '.pptx', label: 'PowerPoint (.pptx)' },
          { value: '.txt', label: 'Texto (.txt)' },
          { value: '.csv', label: 'CSV (.csv)' },
          { value: 'image/*', label: 'Imágenes (todas)' },
          { value: '.jpg', label: 'JPEG (.jpg)' },
          { value: '.jpeg', label: 'JPEG (.jpeg)' },
          { value: '.png', label: 'PNG (.png)' },
          { value: '.gif', label: 'GIF (.gif)' },
          { value: '.svg', label: 'SVG (.svg)' },
          { value: '.zip', label: 'ZIP (.zip)' },
          { value: '.rar', label: 'RAR (.rar)' },
        ]
        
        const selectedTypes = (question.config.allowedTypes as string[]) || []
        
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipos de archivo permitidos
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto bg-white">
                <div className="space-y-2">
                  {fileTypeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(option.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...selectedTypes, option.value]
                            : selectedTypes.filter(t => t !== option.value)
                          handleConfigUpdate('allowedTypes', newTypes)
                        }}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {selectedTypes.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  Seleccionados: {selectedTypes.join(', ')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tamaño máximo (MB)
              </label>
              <input
                type="number"
                value={(question.config.maxSize as number) ?? 5}
                onChange={(e) => handleConfigUpdate('maxSize', parseInt(e.target.value) || 5)}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
              />
            </div>
          </div>
        )

      // Grid (matriz)
      case 'GRID':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filas</label>
              {((question.config.rows as Array<{ text: string }>) || []).map((row, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={row.text}
                    onChange={(e) => {
                      const newRows = [...((question.config.rows as Array<{ text: string }>) || [])]
                      newRows[index] = { text: e.target.value }
                      handleConfigUpdate('rows', newRows)
                    }}
                    placeholder={`Fila ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const newRows = [...((question.config.rows as Array<{ text: string }>) || [])]
                      newRows.splice(index, 1)
                      handleConfigUpdate('rows', newRows)
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                  >
                    <i className="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const currentRows = [...((question.config.rows as Array<{ text: string }>) || [])]
                  handleConfigUpdate('rows', [...currentRows, { text: '' }])
                }}
                className="text-[purple-600] hover:text-[purple-700] text-sm font-medium"
              >
                <i className="fa-solid fa-plus-circle mr-1"></i>
                Agregar fila
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Columnas</label>
              {((question.config.columns as Array<{ text: string }>) || []).map((col, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={col.text}
                    onChange={(e) => {
                      const newCols = [...((question.config.columns as Array<{ text: string }>) || [])]
                      newCols[index] = { text: e.target.value }
                      handleConfigUpdate('columns', newCols)
                    }}
                    placeholder={`Columna ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const newCols = [...((question.config.columns as Array<{ text: string }>) || [])]
                      newCols.splice(index, 1)
                      handleConfigUpdate('columns', newCols)
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                  >
                    <i className="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const currentCols = [...((question.config.columns as Array<{ text: string }>) || [])]
                  handleConfigUpdate('columns', [...currentCols, { text: '' }])
                }}
                className="text-[purple-600] hover:text-[purple-700] text-sm font-medium"
              >
                <i className="fa-solid fa-plus-circle mr-1"></i>
                Agregar columna
              </button>
            </div>
          </div>
        )

      // Tipos sin configuración especial
      default:
        return (
          <p className="text-sm text-gray-500 italic">
            Este tipo de pregunta no requiere configuración adicional
          </p>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Título de la pregunta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título de la pregunta <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={question.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Escribe tu pregunta aquí..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent"
        />
      </div>

      {/* Texto de ayuda */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto de ayuda (opcional)
        </label>
        <input
          type="text"
          value={question.help_text || ''}
          onChange={(e) => onUpdate({ help_text: e.target.value })}
          placeholder="Texto adicional para orientar al usuario..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[purple-600] focus:border-transparent text-sm"
        />
      </div>

      {/* Configuración específica del tipo */}
      {renderConfigEditor()}

      {/* Requerido */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.tempId}`}
          checked={question.is_required}
          onChange={(e) => onUpdate({ is_required: e.target.checked })}
          className="h-5 w-5 text-[purple-600] focus:ring-[purple-600] border-gray-300 rounded"
        />
        <label htmlFor={`required-${question.tempId}`} className="ml-3 text-sm font-medium text-gray-700">
          Pregunta requerida
        </label>
      </div>
    </div>
  )
}
