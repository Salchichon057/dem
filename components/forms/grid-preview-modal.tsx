'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { exportToExcel, type ExcelColumn } from '@/lib/utils/excel-export'

interface GridPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gridData: {
    columns: Array<{ id: string; label: string }>
    rows: Array<Record<string, string | number>>
  }
  questionTitle: string
}

export default function GridPreviewModal({
  open,
  onOpenChange,
  gridData,
  questionTitle,
}: GridPreviewModalProps) {
  
  const handleExportToExcel = () => {
    if (!gridData.rows.length) {
      toast.error('No hay datos para exportar')
      return
    }

    try {
      // Build Excel columns
      const excelColumns: ExcelColumn[] = gridData.columns.map(col => ({
        header: col.label,
        key: col.id,
        width: 20,
      }))

      // Export to Excel
      exportToExcel({
        fileName: questionTitle.replace(/\s+/g, '_'),
        sheetName: 'Datos',
        columns: excelColumns,
        data: gridData.rows,
        includeTimestamp: true,
      })

      toast.success('Tabla exportada a Excel')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Error al exportar el archivo')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex-1">{questionTitle}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              title="Exportar tabla a Excel"
              className="ml-4"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 border rounded-lg overflow-auto max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                {gridData.columns.map((column) => (
                  <TableHead key={column.id} className="font-semibold">
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {gridData.rows.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={gridData.columns.length} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    No hay datos en esta tabla
                  </TableCell>
                </TableRow>
              ) : (
                gridData.rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {gridData.columns.map((column) => (
                      <TableCell key={column.id}>
                        {row[column.id] ?? '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Total de filas: {gridData.rows.length}
        </div>
      </DialogContent>
    </Dialog>
  )
}
