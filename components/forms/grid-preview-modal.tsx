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
import { Download } from 'lucide-react'
import { toast } from 'sonner'

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
  
  const exportToCSV = () => {
    if (!gridData.rows.length) {
      toast.error('No hay datos para exportar')
      return
    }

    // Crear CSV headers
    const headers = gridData.columns.map(col => col.label)

    // Crear filas CSV
    const rows = gridData.rows.map(row => 
      gridData.columns.map(col => {
        const value = row[col.id]
        if (value === null || value === undefined) return ''
        return String(value).replace(/"/g, '""')
      })
    )

    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${questionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Tabla exportada a CSV')
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
              onClick={exportToCSV}
              title="Exportar tabla a CSV"
              className="ml-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
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
