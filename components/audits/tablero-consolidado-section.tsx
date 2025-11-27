/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Search, FileText, FileSpreadsheet, Edit, Table, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { EditBoardExtrasDialog } from "./edit-board-extras-dialog"
import { SemaforoEstadisticas } from "./semaforo-estadisticas"
import DateFilter from "@/components/shared/date-filter"
import { exportToExcel, type ExcelColumn } from "@/lib/utils/excel-export"

type ViewMode = 'table' | 'stats'

interface ColumnDefinition {
  id: string
  title: string
  type: string
}

interface SubmissionRow {
  submission_id: string
  user_name: string
  user_email: string
  submitted_at: string
  [key: string]: any
}

interface BoardExtras {
  traffic_light: string | null
  recommendations: string | null
  follow_up_given: boolean
  follow_up_date: string | null
  concluded_result_red_or_no: string | null
  solutions: string | null
  preliminary_report: string | null
  full_report: string | null
}

export function TableroConsolidadoSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [data, setData] = useState<SubmissionRow[]>([])
  const [columns, setColumns] = useState<ColumnDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState<SubmissionRow[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [formTemplateId] = useState("5bd783b6-e52c-48de-ab3b-9e7ae8538bd2") // Consolidado de Auditorías 2025
  const [boardExtras, setBoardExtras] = useState<Record<string, BoardExtras>>({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      fetchAllBoardExtras()
    }
  }, [data])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/submissions/${formTemplateId}`)
      const result = await response.json()
      if (response.ok) {
        setColumns(result.columns || [])
        setData(result.data || [])
        setFilteredData(result.data || [])
      } else {
        toast.error('Error al cargar envíos: ' + (result.error || 'Error desconocido'))
      }
    } catch (error) {
      toast.error('Error al cargar envíos')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllBoardExtras = async () => {
    try {
      const extrasMap: Record<string, BoardExtras> = {}
      
      await Promise.all(
        data.map(async (row) => {
          try {
            const response = await fetch(`/api/board-extras/${row.submission_id}`)
            if (response.ok) {
              const extras = await response.json()
              extrasMap[row.submission_id] = extras
            }
          } catch (error) {
          }
        })
      )
      
      setBoardExtras(extrasMap)
    } catch (error) {
    }
  }

  const handleEditExtras = (submissionId: string) => {
    setSelectedSubmissionId(submissionId)
    setEditDialogOpen(true)
  }

  const handleExtrasSaved = () => {
    fetchAllBoardExtras()
  }

  // Search and date filters
  useEffect(() => {
    let filtered = data
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(row => {
        return (
          row.user_name?.toLowerCase().includes(searchLower) ||
          row.user_email?.toLowerCase().includes(searchLower) ||
          columns.some(col => {
            const value = row[col.id]
            return value && String(value).toLowerCase().includes(searchLower)
          })
        )
      })
    }
    
    // Aplicar filtro de fecha (submitted_at)
    if (selectedYear !== 'all') {
      filtered = filtered.filter(row => {
        const submittedDate = new Date(row.submitted_at)
        const rowYear = submittedDate.getFullYear()
        
        if (rowYear !== parseInt(selectedYear)) return false
        
        if (selectedMonth !== 'all') {
          const rowMonth = submittedDate.getMonth() + 1
          return rowMonth === parseInt(selectedMonth)
        }
        
        return true
      })
    }
    
    setFilteredData(filtered)
  }, [searchTerm, selectedYear, selectedMonth, data, columns])

  const formatCellValue = (value: any, type: string): string => {
    if (value === null || value === undefined || value === '') return '-'
    
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value)
      return entries.map(([k, v]) => `${k}: ${v}`).join(' | ')
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No'
    }
    
    if (type === 'DATE') {
      try {
        return new Date(value).toLocaleDateString('es-GT')
      } catch {
        return String(value)
      }
    }
    
    return String(value)
  }

  const handleExportToExcel = () => {
    if (filteredData.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      // Build Excel columns
      const excelColumns: ExcelColumn[] = [
        { header: 'Nombre Usuario', key: 'user_name', width: 25 },
        { header: 'Email Usuario', key: 'user_email', width: 30 },
        { header: 'Fecha Envío', key: 'submitted_at', width: 20 },
      ]

      // Add dynamic form columns
      columns.forEach(col => {
        excelColumns.push({
          header: col.title,
          key: col.id,
          width: 25,
        })
      })

      // Add board extras columns
      excelColumns.push(
        { header: 'Semáforo', key: 'traffic_light', width: 15 },
        { header: 'Recomendaciones', key: 'recommendations', width: 40 },
        { header: 'Se dio seguimiento', key: 'follow_up_given', width: 20 },
        { header: 'Fecha del seguimiento', key: 'follow_up_date', width: 20 },
        { header: 'Concluido', key: 'concluded_result_red_or_no', width: 15 },
        { header: 'Soluciones', key: 'solutions', width: 40 },
        { header: 'Informe Preliminar', key: 'preliminary_report', width: 40 },
        { header: 'Informe Completo', key: 'full_report', width: 40 },
      )

      // Transform data for Excel
      const excelData = filteredData.map(row => {
        const extras = boardExtras[row.submission_id]
        const transformedRow: any = {
          user_name: row.user_name || '',
          user_email: row.user_email || '',
          submitted_at: new Date(row.submitted_at).toLocaleDateString('es-GT'),
        }

        // Add dynamic columns
        columns.forEach(col => {
          transformedRow[col.id] = formatCellValue(row[col.id], col.type)
        })

        // Add board extras
        transformedRow.traffic_light = extras?.traffic_light || ''
        transformedRow.recommendations = extras?.recommendations || ''
        transformedRow.follow_up_given = extras?.follow_up_given ? 'Sí' : 'No'
        transformedRow.follow_up_date = extras?.follow_up_date || ''
        transformedRow.concluded_result_red_or_no = extras?.concluded_result_red_or_no || ''
        transformedRow.solutions = extras?.solutions || ''
        transformedRow.preliminary_report = extras?.preliminary_report || ''
        transformedRow.full_report = extras?.full_report || ''

        return transformedRow
      })

      // Export to Excel
      exportToExcel({
        fileName: 'tablero_consolidado_auditorias',
        sheetName: 'Auditorías',
        columns: excelColumns,
        data: excelData,
        includeTimestamp: true,
      })

      toast.success('Archivo Excel descargado')
    } catch (error) {
      toast.error('Error al exportar el archivo')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del tablero consolidado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con título y tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tablero Consolidado</h1>
          <p className="text-muted-foreground">
            Consolidado de Auditorías 2025
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          onClick={() => setViewMode('table')}
          className="gap-2"
        >
          <Table className="w-5 h-5" />
          Tabla de Datos
        </Button>
        <Button
          variant={viewMode === 'stats' ? 'default' : 'ghost'}
          onClick={() => setViewMode('stats')}
          className="gap-2"
        >
          <BarChart3 className="w-5 h-5" />
          Estadísticas Semáforo
        </Button>
      </div>

      {/* Content based on selected tab */}
      {viewMode === 'stats' ? (
        <SemaforoEstadisticas />
      ) : (
        <>
          {/* Header de tabla con botón exportar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">
              {filteredData.length} envíos encontrados
            </p>
            <Button
              onClick={handleExportToExcel}
              variant="outline"
              className="gap-2"
              disabled={filteredData.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </Button>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Envíos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">
              auditorías registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar en todos los campos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Date Filter */}
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tabla de Datos - Auditorías</CardTitle>
          <CardDescription>
            {filteredData.length} envíos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                    Nombre Usuario
                  </th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">
                    Email Usuario
                  </th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">
                    Fecha Envío
                  </th>
                  {columns.map((col) => (
                    <th key={col.id} className="text-left p-3 font-semibold text-xs whitespace-nowrap">
                      {col.title}
                    </th>
                  ))}
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Semáforo</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Recomendaciones</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Se dio seguimiento</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Fecha del seguimiento</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Concluido</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Soluciones</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Informe Preliminar</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Informe Completo</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap sticky right-0 bg-gray-50 z-10">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 12} className="text-center p-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <p>No se encontraron envíos</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.submission_id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-xs sticky left-0 bg-white hover:bg-gray-50">
                        {row.user_name || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {row.user_email || '-'}
                      </td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        {new Date(row.submitted_at).toLocaleDateString('es-GT')}
                      </td>
                      {columns.map((col) => (
                        <td key={col.id} className="p-3 text-xs max-w-xs truncate" title={formatCellValue(row[col.id], col.type)}>
                          {formatCellValue(row[col.id], col.type)}
                        </td>
                      ))}
                      {/* Columnas extras */}
                      <td className="p-3 text-xs">
                        {boardExtras[row.submission_id]?.traffic_light && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            boardExtras[row.submission_id].traffic_light === 'Rojo' ? 'bg-red-100 text-red-800' :
                            boardExtras[row.submission_id].traffic_light === 'Amarillo' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {boardExtras[row.submission_id].traffic_light}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs max-w-xs truncate" title={boardExtras[row.submission_id]?.recommendations || '-'}>
                        {boardExtras[row.submission_id]?.recommendations || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {boardExtras[row.submission_id]?.follow_up_given ? 'Sí' : 'No'}
                      </td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        {boardExtras[row.submission_id]?.follow_up_date
                          ? new Date(boardExtras[row.submission_id].follow_up_date!).toLocaleDateString('es-GT')
                          : '-'}
                      </td>
                      <td className="p-3 text-xs max-w-xs truncate" title={boardExtras[row.submission_id]?.concluded_result_red_or_no || '-'}>
                        {boardExtras[row.submission_id]?.concluded_result_red_or_no || '-'}
                      </td>
                      <td className="p-3 text-xs max-w-xs truncate" title={boardExtras[row.submission_id]?.solutions || '-'}>
                        {boardExtras[row.submission_id]?.solutions || '-'}
                      </td>
                      <td className="p-3 text-xs max-w-xs truncate" title={boardExtras[row.submission_id]?.preliminary_report || '-'}>
                        {boardExtras[row.submission_id]?.preliminary_report || '-'}
                      </td>
                      <td className="p-3 text-xs max-w-xs truncate" title={boardExtras[row.submission_id]?.full_report || '-'}>
                        {boardExtras[row.submission_id]?.full_report || '-'}
                      </td>
                      {/* Columna de acciones */}
                      <td className="p-3 text-xs sticky right-0 bg-white hover:bg-gray-50">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditExtras(row.submission_id)}
                          className="gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Editar Extras
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

          {/* Diálogo de edición */}
          {selectedSubmissionId && (
            <EditBoardExtrasDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              submissionId={selectedSubmissionId}
              onSaved={handleExtrasSaved}
            />
          )}
        </>
      )}
    </div>
  )
}
