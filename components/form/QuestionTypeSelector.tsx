'use client'

import { 
  Type, 
  AlignLeft, 
  Hash, 
  Mail, 
  Phone, 
  Link, 
  Circle, 
  List, 
  ChevronDown, 
  ToggleLeft, 
  CheckSquare, 
  ListChecks,
  Calendar, 
  Clock, 
  Star, 
  SlidersHorizontal, 
  Upload, 
  Table, 
  Minus, 
  Heading, 
  Image, 
  Video,
  HelpCircle,
  X
} from 'lucide-react'
import type { QuestionType } from '@/lib/types'

interface QuestionTypeSelectorProps {
  questionTypes: QuestionType[]
  onSelect: (typeId: string, typeCode: string) => void
  onClose: () => void
}

// Componentes de iconos para cada tipo de pregunta
const QUESTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  TEXT: Type,
  PARAGRAPH_TEXT: AlignLeft,
  NUMBER: Hash,
  EMAIL: Mail,
  PHONE: Phone,
  URL: Link,
  MULTIPLE_CHOICE: Circle,
  RADIO: Circle,
  LIST: List,
  DROPDOWN: ChevronDown,
  YES_NO: ToggleLeft,
  CHECKBOX: CheckSquare,
  DROPDOWN_MULTIPLE: ListChecks,
  DATE: Calendar,
  TIME: Clock,
  RATING: Star,
  LINEAR_SCALE: SlidersHorizontal,
  FILE_UPLOAD: Upload,
  GRID: Table,
  PAGE_BREAK: Minus,
  SECTION_HEADER: Heading,
  IMAGE: Image,
  VIDEO: Video,
}

// Categorías de preguntas
const CATEGORIES = [
  {
    name: 'Texto y Números',
    codes: ['TEXT', 'PARAGRAPH_TEXT', 'NUMBER', 'EMAIL', 'PHONE', 'URL']
  },
  {
    name: 'Selección',
    codes: ['MULTIPLE_CHOICE', 'RADIO', 'CHECKBOX', 'LIST', 'DROPDOWN', 'DROPDOWN_MULTIPLE', 'YES_NO']
  },
  {
    name: 'Fecha y Hora',
    codes: ['DATE', 'TIME']
  },
  {
    name: 'Calificación',
    codes: ['RATING', 'LINEAR_SCALE']
  },
  {
    name: 'Avanzado',
    codes: ['FILE_UPLOAD', 'GRID']
  },
  {
    name: 'Diseño',
    codes: ['SECTION_HEADER', 'PAGE_BREAK', 'IMAGE', 'VIDEO']
  }
]

export default function QuestionTypeSelector({ questionTypes, onSelect, onClose }: QuestionTypeSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Seleccionar Tipo de Pregunta</h2>
            <p className="text-sm text-gray-600 mt-1">Elige el tipo de respuesta que necesitas</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Grid de tipos por categoría */}
        <div className="p-6 space-y-8">
          {CATEGORIES.map((category) => {
            const typesInCategory = questionTypes.filter(qt => category.codes.includes(qt.code))
            if (typesInCategory.length === 0) return null

            return (
              <div key={category.name}>
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
                    {typesInCategory.length}
                  </span>
                  {category.name}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typesInCategory.map((type) => {
                    const IconComponent = QUESTION_ICONS[type.code] || HelpCircle
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => onSelect(type.id, type.code)}
                        className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-pink-50 transition-all group"
                      >
                        <div className="flex items-start">
                          <div className="bg-gray-100 group-hover:bg-purple-600 group-hover:text-white rounded-lg w-12 h-12 flex items-center justify-center mr-3 transition-colors shrink-0">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                              {type.name}
                            </h4>
                            {type.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {type.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
