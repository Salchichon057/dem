import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { exportToExcel, type ExcelColumn } from '@/lib/utils/excel-export'

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

interface ExportExcelButtonProps {
  filteredData: SubmissionRow[]
  columns: ColumnDefinition[]
  visibleColumns: Record<string, boolean>
  formName: string
}

export function ExportExcelButton({
  filteredData,
  columns,
  visibleColumns,
  formName,
}: ExportExcelButtonProps) {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanValue = (value: any, type?: string): any => {
    if (value === null || value === undefined || value === '') return ''
    
    // Handle arrays (multiple checkboxes)
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    
    // Handle objects (GRID, etc)
    if (typeof value === 'object') {
      // For GRID, convert to readable format
      const entries = Object.entries(value)
      return entries.map(([k, v]) => `${k}: ${v}`).join(' | ')
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No'
    }
    
    // Handle dates
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
      // Build column definitions with only visible columns
      const excelColumns: ExcelColumn[] = []
      
      if (visibleColumns.user_name) {
        excelColumns.push({ header: 'Nombre Usuario', key: 'user_name', width: 25 })
      }
      if (visibleColumns.user_email) {
        excelColumns.push({ header: 'Email Usuario', key: 'user_email', width: 30 })
      }
      if (visibleColumns.submitted_at) {
        excelColumns.push({ header: 'Fecha Envío', key: 'submitted_at', width: 20 })
      }
      
      columns.forEach(col => {
        if (visibleColumns[col.id]) {
          excelColumns.push({ 
            header: col.title, 
            key: col.id,
            width: col.title.length > 20 ? 30 : 20
          })
        }
      })

      // Transform data for Excel export
      const excelData = filteredData.map(row => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedRow: any = {}
        
        if (visibleColumns.user_name) {
          transformedRow.user_name = row.user_name
        }
        if (visibleColumns.user_email) {
          transformedRow.user_email = row.user_email
        }
        if (visibleColumns.submitted_at) {
          transformedRow.submitted_at = new Date(row.submitted_at).toLocaleString('es-GT')
        }
        
        columns.forEach(col => {
          if (visibleColumns[col.id]) {
            transformedRow[col.id] = cleanValue(row[col.id], col.type)
          }
        })
        
        return transformedRow
      })

      // Export to Excel
      exportToExcel({
        fileName: formName.replace(/\s+/g, '_'),
        sheetName: 'Envíos',
        columns: excelColumns,
        data: excelData,
        includeTimestamp: true,
      })

      toast.success(`Archivo Excel exportado (${filteredData.length} filas, ${excelColumns.length} columnas)`)
    } catch {
      toast.error('Error al exportar el archivo')
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleExportToExcel}
      className="gap-2"
      disabled={filteredData.length === 0}
    >
      <FileSpreadsheet className="w-4 h-4" />
      Exportar Excel
    </Button>
  )
}

