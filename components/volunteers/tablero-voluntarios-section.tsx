/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { getVolunteerFormId } from "@/lib/config/volunteers.config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FileText, FileSpreadsheet, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { EditVolunteerExtrasDialog } from "./edit-volunteer-extras-dialog"
import { exportToExcel, type ExcelColumn } from "@/lib/utils/excel-export"

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
  [key: string]: unknown
}

interface VolunteerExtras {
  total_hours: number
  receives_benefit: boolean
  benefit_number: string | null
  agricultural_pounds: number
  unit_cost_q: number | null
  unit_cost_usd: number | null
  viveres_bags: number | null
  average_cost_30lbs: number | null
  picking_gtq: number | null
  picking_5lbs: number | null
  total_amount_q: number | null
  group_number: number | null
}

export function TableroVoluntariosSection() {
  const [data, setData] = useState<SubmissionRow[]>([])
  const [columns, setColumns] = useState<ColumnDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [formTemplateId] = useState(getVolunteerFormId())
  const [volunteerExtras, setVolunteerExtras] = useState<Record<string, VolunteerExtras>>({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTotalCount()
  }, [])

  useEffect(() => {
    fetchPageData()
  }, [currentPage])

  const fetchTotalCount = async () => {
    try {
      const response = await fetch(`/api/submissions/${formTemplateId}/count`)
      const result = await response.json()
      if (response.ok) {
        setTotalRecords(result.count)
        setTotalPages(Math.ceil(result.count / itemsPerPage))
      }
    } catch {
      toast.error('Error al obtener total de registros')
    }
  }

  const fetchPageData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/submissions/${formTemplateId}/paginated?page=${currentPage}&limit=${itemsPerPage}`)
      const result = await response.json()
      if (response.ok) {
        setColumns(result.columns || [])
        setData(result.data || [])
        fetchPageVolunteerExtras(result.data || [])
      } else {
        toast.error('Error al cargar envíos: ' + (result.error || 'Error desconocido'))
      }
    } catch {
      toast.error('Error al cargar envíos')
    } finally {
      setLoading(false)
    }
  }

  const fetchPageVolunteerExtras = async (pageData: SubmissionRow[]) => {
    try {
      const extrasMap: Record<string, VolunteerExtras> = { ...volunteerExtras }
      
      await Promise.all(
        pageData.map(async (row) => {
          if (extrasMap[row.submission_id]) return
          
          try {
            const response = await fetch(`/api/volunteer-extras/${row.submission_id}`)
            if (response.ok) {
              const extras = await response.json()
              extrasMap[row.submission_id] = extras
            }
          } catch {
          }
        })
      )
      
      setVolunteerExtras(extrasMap)
    } catch {
    }
  }

  const handleEditExtras = (submissionId: string) => {
    setSelectedSubmissionId(submissionId)
    setEditDialogOpen(true)
  }

  const handleExtrasSaved = () => {
    fetchPageVolunteerExtras(data)
  }

  const formatCellValue = (value: unknown, type: string): string => {
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
        return new Date(String(value)).toLocaleDateString('es-GT')
      } catch {
        return String(value)
      }
    }
    
    return String(value)
  }

  const handleExportToExcel = () => {
    if (data.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      const excelColumns: ExcelColumn[] = [
        { header: 'Nombre Usuario', key: 'user_name', width: 25 },
        { header: 'Email Usuario', key: 'user_email', width: 30 },
        { header: 'Fecha Envío', key: 'submitted_at', width: 20 },
      ]

      columns.forEach(col => {
        excelColumns.push({
          header: col.title,
          key: col.id,
          width: 25,
        })
      })

      excelColumns.push(
        { header: 'Horas Totales', key: 'total_hours', width: 15 },
        { header: 'Recibe Beneficio', key: 'receives_benefit', width: 20 },
        { header: 'Número de Beneficio', key: 'benefit_number', width: 20 },
        { header: 'Libras Agrícolas', key: 'agricultural_pounds', width: 20 },
        { header: 'Costo Unitario Q', key: 'unit_cost_q', width: 20 },
        { header: 'Costo Unitario USD', key: 'unit_cost_usd', width: 20 },
        { header: 'Bolsas de Víveres', key: 'viveres_bags', width: 20 },
        { header: 'Costo Promedio 30lbs', key: 'average_cost_30lbs', width: 20 },
        { header: 'Picking GTQ', key: 'picking_gtq', width: 15 },
        { header: 'Picking 5lbs', key: 'picking_5lbs', width: 15 },
        { header: 'Monto Total Q', key: 'total_amount_q', width: 20 },
        { header: 'Número de Grupo', key: 'group_number', width: 20 },
      )

      const excelData = data.map(row => {
        const extras = volunteerExtras[row.submission_id]
        const transformedRow: Record<string, unknown> = {
          user_name: row.user_name || '',
          user_email: row.user_email || '',
          submitted_at: new Date(row.submitted_at).toLocaleDateString('es-GT'),
        }

        columns.forEach(col => {
          transformedRow[col.id] = formatCellValue(row[col.id], col.type)
        })

        transformedRow.total_hours = extras?.total_hours || ''
        transformedRow.receives_benefit = extras?.receives_benefit ? 'Sí' : 'No'
        transformedRow.benefit_number = extras?.benefit_number || ''
        transformedRow.agricultural_pounds = extras?.agricultural_pounds || ''
        transformedRow.unit_cost_q = extras?.unit_cost_q || ''
        transformedRow.unit_cost_usd = extras?.unit_cost_usd || ''
        transformedRow.viveres_bags = extras?.viveres_bags || ''
        transformedRow.average_cost_30lbs = extras?.average_cost_30lbs || ''
        transformedRow.picking_gtq = extras?.picking_gtq || ''
        transformedRow.picking_5lbs = extras?.picking_5lbs || ''
        transformedRow.total_amount_q = extras?.total_amount_q || ''
        transformedRow.group_number = extras?.group_number || ''

        return transformedRow
      })

      exportToExcel({
        fileName: 'tablero_voluntarios_pagina',
        sheetName: 'Voluntarios',
        columns: excelColumns,
        data: excelData,
        includeTimestamp: true,
      })

      toast.success('Archivo Excel descargado (página actual)')
    } catch {
      toast.error('Error al exportar el archivo')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos de voluntariado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tablero de Voluntariado</h1>
          <p className="text-muted-foreground">
            Consolidado de Voluntarios 2025
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-gray-600">
          Mostrando página {currentPage} de {totalPages} ({totalRecords} registros totales)
        </p>
        <Button
          onClick={handleExportToExcel}
          variant="outline"
          className="gap-2"
          disabled={data.length === 0}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Página Actual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Envíos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              voluntariados registrados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de Datos - Voluntariado</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages}
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
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Horas Totales</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Recibe Beneficio</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Número de Beneficio</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Libras Agrícolas</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Costo Unitario Q</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Costo Unitario USD</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Bolsas de Víveres</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Costo Promedio 30lbs</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Picking GTQ</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Picking 5lbs</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Monto Total Q</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap">Número de Grupo</th>
                  <th className="text-left p-3 font-semibold text-xs whitespace-nowrap sticky right-0 bg-gray-50 z-10">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 15} className="text-center p-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <p>No se encontraron envíos</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
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
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.total_hours || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.receives_benefit ? 'Sí' : 'No'}
                      </td>
                      <td className="p-3 text-xs max-w-xs truncate" title={volunteerExtras[row.submission_id]?.benefit_number || '-'}>
                        {volunteerExtras[row.submission_id]?.benefit_number || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.agricultural_pounds || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.unit_cost_q || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.unit_cost_usd || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.viveres_bags || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.average_cost_30lbs || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.picking_gtq || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.picking_5lbs || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.total_amount_q || '-'}
                      </td>
                      <td className="p-3 text-xs">
                        {volunteerExtras[row.submission_id]?.group_number || '-'}
                      </td>
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

      {!loading && data.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords} registros
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

      {selectedSubmissionId && (
        <EditVolunteerExtrasDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          submissionId={selectedSubmissionId}
          onSaved={handleExtrasSaved}
        />
      )}
    </div>
  )
}
