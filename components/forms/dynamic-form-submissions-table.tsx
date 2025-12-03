'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Eye, Settings2, FileText, Image as ImageIcon, Table as TableIcon } from 'lucide-react'
import DateFilter from '@/components/shared/date-filter'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import FilePreviewModal from './file-preview-modal'
import GridPreviewModal from './grid-preview-modal'
import { ExportExcelButton } from './export-excel-button'
import { SubmissionDetailModal } from './submission-detail-modal'
import { useDynamicFormSubmissions } from '@/hooks/use-dynamic-form-submissions'

interface SubmissionRow {
  submission_id: string
  submitted_at: string
  user_name: string
  user_email: string
  [key: string]: string | number | boolean | null
}

interface DynamicFormSubmissionsTableProps {
  sectionLocation: string
  sectionTitle: string
}

export default function DynamicFormSubmissionsTable({ 
  sectionLocation,
  sectionTitle 
}: DynamicFormSubmissionsTableProps) {
  // Use custom hook for data management
  const {
    forms,
    selectedFormId,
    formName,
    columns,
    filteredData,
    paginatedData,
    loading,
    currentPage,
    totalPages,
    totalCount,
    searchTerm,
    selectedYear,
    selectedMonth,
    visibleColumns,
    allColumnsChecked,
    setSelectedFormId,
    setSearchTerm,
    setSelectedYear,
    setSelectedMonth,
    setCurrentPage,
    toggleColumn,
    toggleAllColumns,
  } = useDynamicFormSubmissions({ sectionLocation })

  // Modals
  const [detailModal, setDetailModal] = useState<{
    open: boolean
    submission: SubmissionRow | null
  }>({ open: false, submission: null })
  const [filePreviewModal, setFilePreviewModal] = useState<{
    open: boolean
    fileUrl: string
    fileName: string
  }>({ open: false, fileUrl: '', fileName: '' })

  const [gridPreviewModal, setGridPreviewModal] = useState<{
    open: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gridData: any
    questionTitle: string
  }>({ open: false, gridData: null, questionTitle: '' })

  // Render value based on question type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderValue = (value: any, type: string, questionTitle?: string) => {
    if (value === null || value === undefined || value === '') return '-'
    
    switch (type) {
      // ===== VALORES SIMPLES =====
      case 'TEXT':
      case 'NUMBER':
      case 'TIME':
        return String(value)
      
      case 'PARAGRAPH_TEXT':
        // Texto largo - mostrar preview con tooltip o modal si es muy largo
        const textValue = String(value)
        if (textValue.length > 100) {
          return (
            <div className="max-w-xs">
              <p className="truncate" title={textValue}>
                {textValue}
              </p>
              <span className="text-xs text-gray-500">
                ({textValue.length} caracteres)
              </span>
            </div>
          )
        }
        return textValue
      
      case 'EMAIL':
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {String(value)}
          </a>
        )
      
      case 'PHONE':
        return (
          <a href={`tel:${value}`} className="text-blue-600 hover:underline">
            {String(value)}
          </a>
        )
      
      case 'URL':
        return (
          <a 
            href={String(value)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            {String(value).length > 50 ? String(value).substring(0, 50) + '...' : String(value)}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )
      
      case 'YES_NO':
        return (
          <span className={value === 'Sí' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {value === 'Sí' ? '✓ Sí' : '✗ No'}
          </span>
        )
      
      case 'CHECKBOX':
        // Si es array (múltiples checkboxes), mostrar como badges
        if (Array.isArray(value)) {
          if (value.length === 0) return '-'
          return (
            <div className="flex flex-wrap gap-1">
              {value.slice(0, 3).map((item, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {String(item)}
                </span>
              ))}
              {value.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  +{value.length - 3} más
                </span>
              )}
            </div>
          )
        }
        // Si es boolean (checkbox simple)
        return (
          <span className={value ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {value ? '☑ Sí' : '☐ No'}
          </span>
        )
      
      case 'MULTIPLE_CHOICE':
      case 'RADIO':
      case 'LIST':
      case 'DROPDOWN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {String(value)}
          </span>
        )
      
      case 'LINEAR_SCALE':
      case 'RATING':
        const numValue = Number(value)
        const stars = '⭐'.repeat(Math.min(numValue, 5))
        return (
          <span className="inline-flex items-center gap-1">
            <span className="text-yellow-500">{stars}</span>
            <span className="text-sm font-medium text-gray-700">{value}</span>
          </span>
        )
      
      case 'DATE':
        try {
          const date = new Date(value)
          return (
            <span className="inline-flex items-center gap-1 text-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date.toLocaleDateString('es-GT')}
            </span>
          )
        } catch {
          return String(value)
        }
      
      // ===== TIPOS COMPLEJOS CON MODAL =====
      case 'FILE_UPLOAD':
        // Si es una URL de storage, mostrar botón para abrir modal
        if (typeof value === 'string' && value.includes('/')) {
          const fileName = value.split('/').pop() || 'archivo'
          const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)
          
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilePreviewModal({ open: true, fileUrl: value, fileName })}
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
          )
        }
        return String(value)
      
      case 'GRID':
        // Si es un objeto tipo Record<string, string> (formato: {"fila1": "col1", "fila2": "col2"})
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Intentar detectar si tiene la estructura de grid completa
          if (value.columns && value.rows) {
            const rowCount = Array.isArray(value.rows) ? value.rows.length : 0
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGridPreviewModal({ 
                  open: true, 
                  gridData: value,
                  questionTitle: questionTitle || 'Tabla de datos'
                })}
                className="gap-2"
              >
                <TableIcon className="w-4 h-4" />
                Ver tabla ({rowCount} filas)
              </Button>
            )
          }
          
          // Si es un objeto simple Record<string, string>, convertirlo a formato de tabla
          const entries = Object.entries(value)
          if (entries.length > 0) {
            // Convertir a formato de tabla: columnas = ["Fila", "Valor"]
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGridPreviewModal({ 
                  open: true, 
                  gridData,
                  questionTitle: questionTitle || 'Tabla de datos'
                })}
                className="gap-2"
              >
                <TableIcon className="w-4 h-4" />
                Ver tabla ({entries.length} filas)
              </Button>
            )
          }
        }
        // Si no es un objeto válido, mostrar como JSON
        return typeof value === 'object' ? JSON.stringify(value) : String(value)
      
      // ===== TIPOS SOLO VISUALES (No generan respuestas) =====
      case 'PAGE_BREAK':
      case 'SECTION_HEADER':
      case 'IMAGE':
      case 'VIDEO':
        return '—' // Estos tipos no generan respuestas
      
      // ===== TIPO DESCONOCIDO =====
      default:
        // Para tipos no manejados, mostrar el valor tal cual
        if (typeof value === 'object') {
          // Si es objeto, intentar mostrar de forma legible
          if (Array.isArray(value)) {
            return value.join(', ')
          }
          return JSON.stringify(value)
        }
        return String(value)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tabla de Datos - {sectionTitle}</h2>
          <p className="text-muted-foreground">
            {selectedFormId !== 'none' 
              ? `${totalCount} envíos encontrados` 
              : 'Selecciona un formulario para ver los datos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedFormId !== 'none' && filteredData.length > 0 && (
            <>
              <ExportExcelButton
                filteredData={filteredData}
                columns={columns}
                visibleColumns={visibleColumns}
                formName={formName}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Settings2 className="w-4 h-4" />
                    Columnas
                    {Object.values(visibleColumns).filter(Boolean).length < Object.keys(visibleColumns).length && (
                      <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {Object.values(visibleColumns).filter(Boolean).length}/{Object.keys(visibleColumns).length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-[500px] overflow-hidden flex flex-col" align="end">
                  <div className="space-y-3">
                    {/* Header con Select All */}
                    <div className="flex items-center justify-between pb-3 border-b">
                      <h3 className="font-semibold text-sm">Columnas visibles</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAllColumns}
                        className="h-7 text-xs"
                      >
                        {allColumnsChecked ? 'Deseleccionar todo' : 'Seleccionar todo'}
                      </Button>
                    </div>
                    
                    {/* Lista de columnas con scroll */}
                    <div className="overflow-y-auto max-h-[380px] pr-2 space-y-2">
                      {/* Fixed columns */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Campos del sistema
                        </p>
                        
                        <label 
                          htmlFor="col-user_name" 
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors hover:bg-accent group ${
                            visibleColumns.user_name ? 'bg-accent/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              id="col-user_name"
                              checked={visibleColumns.user_name}
                              onCheckedChange={() => toggleColumn('user_name')}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm truncate">Nombre Usuario</span>
                          </div>
                          {visibleColumns.user_name && (
                            <span className="text-xs text-blue-600 font-medium ml-2">●</span>
                          )}
                        </label>

                        <label 
                          htmlFor="col-user_email" 
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors hover:bg-accent group ${
                            visibleColumns.user_email ? 'bg-accent/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              id="col-user_email"
                              checked={visibleColumns.user_email}
                              onCheckedChange={() => toggleColumn('user_email')}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm truncate">Email Usuario</span>
                          </div>
                          {visibleColumns.user_email && (
                            <span className="text-xs text-blue-600 font-medium ml-2">●</span>
                          )}
                        </label>

                        <label 
                          htmlFor="col-submitted_at" 
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors hover:bg-accent group ${
                            visibleColumns.submitted_at ? 'bg-accent/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              id="col-submitted_at"
                              checked={visibleColumns.submitted_at}
                              onCheckedChange={() => toggleColumn('submitted_at')}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm truncate">Fecha Envío</span>
                          </div>
                          {visibleColumns.submitted_at && (
                            <span className="text-xs text-blue-600 font-medium ml-2">●</span>
                          )}
                        </label>
                      </div>
                      
                      {/* Dynamic columns from form */}
                      {columns.length > 0 && (
                        <div className="space-y-2 pt-3 border-t mt-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Preguntas del formulario ({columns.length})
                          </p>
                          {columns.map((col) => (
                            <label 
                              key={col.id}
                              htmlFor={`col-${col.id}`}
                              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors hover:bg-accent group ${
                                visibleColumns[col.id] ? 'bg-accent/50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Checkbox
                                  id={`col-${col.id}`}
                                  checked={visibleColumns[col.id]}
                                  onCheckedChange={() => toggleColumn(col.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-sm truncate" title={col.title}>
                                    {col.title}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {col.type}
                                  </span>
                                </div>
                              </div>
                              {visibleColumns[col.id] && (
                                <span className="text-xs text-blue-600 font-medium ml-2">●</span>
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </div>

      {/* Form selector and search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form selector */}
        <Select value={selectedFormId} onValueChange={setSelectedFormId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un formulario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Selecciona un formulario</SelectItem>
            {forms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        {selectedFormId !== 'none' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en todos los campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>
      
      {/* Date Filter */}
      {selectedFormId !== 'none' && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Fecha de Envío:</span>
          <DateFilter
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            showIcons={false}
          />
        </div>
      )}

      {/* Table */}
      {selectedFormId !== 'none' && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.user_name && <TableHead>Nombre Usuario</TableHead>}
                  {visibleColumns.user_email && <TableHead>Email Usuario</TableHead>}
                  {visibleColumns.submitted_at && <TableHead>Fecha Envío</TableHead>}
                  {columns.map((col) => (
                    visibleColumns[col.id] && (
                      <TableHead key={col.id}>
                        {col.title}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({col.type})
                        </span>
                      </TableHead>
                    )
                  ))}
                  <TableHead className="text-right sticky right-0 bg-[#F9FAFB] shadow-[-4px_0_8px_rgba(0,0,0,0.08)] z-10">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-4">
                      {searchTerm ? (
                        <>
                          <div className="rounded-full bg-gray-100 p-4">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-base font-medium text-gray-900 mb-1">
                              No se encontraron resultados
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Intenta con otros términos de búsqueda
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-full bg-blue-50 p-4">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-base font-medium text-gray-900 mb-1">
                              No se registró ningún formulario
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Aún no hay respuestas enviadas para este formulario
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow key={row.submission_id}>
                    {visibleColumns.user_name && (
                      <TableCell className="font-medium">{row.user_name}</TableCell>
                    )}
                    {visibleColumns.user_email && (
                      <TableCell>{row.user_email}</TableCell>
                    )}
                    {visibleColumns.submitted_at && (
                      <TableCell>
                        {new Date(row.submitted_at).toLocaleString('es-GT')}
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      visibleColumns[col.id] && (
                        <TableCell key={col.id}>
                          {renderValue(row[col.id], col.type, col.title)}
                        </TableCell>
                      )
                    ))}
                    <TableCell className="sticky right-0 bg-[#fbfcfe] shadow-[-4px_0_8px_rgba(0,0,0,0.08)] z-10">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Ver detalles"
                          onClick={() => setDetailModal({ open: true, submission: row })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && paginatedData.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando página {currentPage} de {totalPages} ({totalCount} registros totales)
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-9"
            >
              &laquo;
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9"
            >
              &lsaquo;
            </Button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const startPage = Math.max(1, currentPage - 1)
                const endPage = Math.min(totalPages, startPage + 2)
                
                const pages = []
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                      className="w-9"
                    >
                      {i}
                    </Button>
                  )
                }
                return pages
              })()}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9"
            >
              &rsaquo;
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-9"
            >
              &raquo;
            </Button>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        open={filePreviewModal.open}
        onOpenChange={(open) => setFilePreviewModal({ ...filePreviewModal, open })}
        fileUrl={filePreviewModal.fileUrl}
        fileName={filePreviewModal.fileName}
      />

      {/* Grid Preview Modal */}
      {gridPreviewModal.gridData && (
        <GridPreviewModal
          open={gridPreviewModal.open}
          onOpenChange={(open) => setGridPreviewModal({ ...gridPreviewModal, open })}
          gridData={gridPreviewModal.gridData}
          questionTitle={gridPreviewModal.questionTitle}
        />
      )}

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal({ ...detailModal, open })}
        submission={detailModal.submission}
        columns={columns}
        onOpenFilePreview={(fileUrl, fileName) => setFilePreviewModal({ open: true, fileUrl, fileName })}
        onOpenGridPreview={(gridData, questionTitle) => setGridPreviewModal({ open: true, gridData, questionTitle })}
      />
    </div>
  )
}
