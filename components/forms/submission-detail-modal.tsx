import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  User, 
  Mail, 
  FileText, 
  Image as ImageIcon,
  ExternalLink,
  Phone,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Star,
  Table as TableIcon,
} from 'lucide-react'

interface ColumnDefinition {
  id: string
  title: string
  type: string
}

interface SubmissionRow {
  submission_id: string
  submitted_at: string
  user_name: string
  user_email: string
  [key: string]: string | number | boolean | null
}

interface SubmissionDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submission: SubmissionRow | null
  columns: ColumnDefinition[]
  onOpenFilePreview: (fileUrl: string, fileName: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOpenGridPreview: (gridData: any, questionTitle: string) => void
}

export function SubmissionDetailModal({
  open,
  onOpenChange,
  submission,
  columns,
  onOpenFilePreview,
  onOpenGridPreview,
}: SubmissionDetailModalProps) {
  if (!submission) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderDetailValue = (value: any, type: string, questionTitle: string) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">Sin respuesta</span>
    }
    
    switch (type) {
      case 'TEXT':
        return (
          <p className="text-sm leading-relaxed">{String(value)}</p>
        )
      
      case 'NUMBER':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            <span className="text-sm font-mono font-semibold">{String(value)}</span>
          </div>
        )
      
      case 'TIME':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{String(value)}</span>
          </div>
        )
      
      case 'PARAGRAPH_TEXT':
        return (
          <div className="bg-muted/50 p-4 rounded-md border border-muted">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{String(value)}</p>
          </div>
        )
      
      case 'EMAIL':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <Mail className="w-4 h-4" />
            {String(value)}
          </a>
        )
      
      case 'PHONE':
        return (
          <a 
            href={`tel:${value}`} 
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <Phone className="w-4 h-4" />
            {String(value)}
          </a>
        )
      
      case 'URL':
        return (
          <a 
            href={String(value)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
          >
            <LinkIcon className="w-4 h-4 shrink-0" />
            <span>{String(value)}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        )
      
      case 'YES_NO':
        return (
          <div className="inline-flex items-center gap-2">
            {value === 'Sí' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">Sí</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">No</span>
              </>
            )}
          </div>
        )
      
      case 'CHECKBOX':
        if (Array.isArray(value)) {
          if (value.length === 0) return <span className="text-muted-foreground italic">Ninguna seleccionada</span>
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {String(item)}
                </Badge>
              ))}
            </div>
          )
        }
        return (
          <div className="inline-flex items-center gap-2">
            {value ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">Sí</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">No</span>
              </>
            )}
          </div>
        )
      
      case 'MULTIPLE_CHOICE':
      case 'RADIO':
      case 'LIST':
      case 'DROPDOWN':
        return (
          <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            <span className="text-sm font-medium">{String(value)}</span>
          </div>
        )
      
      case 'LINEAR_SCALE':
      case 'RATING':
        const numValue = Number(value)
        const maxRating = 10 // Asumiendo escala hasta 10
        const percentage = (numValue / maxRating) * 100
        
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-yellow-400 to-yellow-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-lg font-bold text-yellow-600 min-w-[3ch] text-right">{value}</span>
              <span className="text-sm text-muted-foreground">/ {maxRating}</span>
            </div>
          </div>
        )
      
      case 'DATE':
        try {
          const date = new Date(value)
          return (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {date.toLocaleDateString('es-GT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )
        } catch {
          return <span className="text-sm">{String(value)}</span>
        }
      
      case 'FILE_UPLOAD':
        if (typeof value === 'string' && value.includes('/')) {
          const fileName = value.split('/').pop() || 'archivo'
          const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)
          
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-xs" title={fileName}>{fileName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenFilePreview(value, fileName)}
                className="gap-2"
              >
                {isImage ? (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    Ver imagen
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Ver archivo
                  </>
                )}
              </Button>
            </div>
          )
        }
        return <span className="text-sm">{String(value)}</span>
      
      case 'GRID':
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Check if it has full grid structure
          if (value.columns && value.rows) {
            const rowCount = Array.isArray(value.rows) ? value.rows.length : 0
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TableIcon className="w-4 h-4" />
                  <span>Tabla con {rowCount} filas</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenGridPreview(value, questionTitle)}
                  className="gap-2"
                >
                  <TableIcon className="w-4 h-4" />
                  Ver tabla completa
                </Button>
              </div>
            )
          }
          
          // Simple object Record<string, string>
          const entries = Object.entries(value)
          if (entries.length > 0) {
            const gridData = {
              columns: [
                { id: 'row', label: 'Fila' },
                { id: 'value', label: 'Valor' }
              ],
              rows: entries.map(([key, val]) => ({
                row: key,
                value: String(val)
              }))
            }
            
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TableIcon className="w-4 h-4" />
                  <span>Tabla con {entries.length} filas</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenGridPreview(gridData, questionTitle)}
                  className="gap-2"
                >
                  <TableIcon className="w-4 h-4" />
                  Ver tabla
                </Button>
              </div>
            )
          }
        }
        return <span className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
      
      case 'PAGE_BREAK':
      case 'SECTION_HEADER':
      case 'IMAGE':
      case 'VIDEO':
        return <span className="text-muted-foreground italic">—</span>
      
      default:
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            return <span>{value.join(', ')}</span>
          }
          return <span>{JSON.stringify(value)}</span>
        }
        return <span>{String(value)}</span>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle del Envío</DialogTitle>
          <DialogDescription>
            Información completa de la respuesta enviada
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pb-6">
            {/* User Information Section */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Información del Usuario
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Nombre
                  </div>
                  <p className="text-sm pl-6">{submission.user_name}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </div>
                  <p className="text-sm pl-6">{submission.user_email}</p>
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Fecha de Envío
                  </div>
                  <p className="text-sm pl-6">
                    {new Date(submission.submitted_at).toLocaleString('es-GT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Responses Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Respuestas del Formulario
              </h3>
              
              {columns.map((col, index) => (
                <div key={col.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-2">{col.title}</h4>
                      <div>
                        {renderDetailValue(submission[col.id], col.type, col.title)}
                      </div>
                    </div>
                  </div>
                  {index < columns.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </div>
      </DialogContent>
    </Dialog>
  )
}
