'use client'

import { BeneficiaryStats } from '@/lib/types'
import { FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToExcel, type ExcelColumn } from '@/lib/utils/excel-export'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, Title, Text } from '@tremor/react'

interface SummaryTableProps {
  stats: BeneficiaryStats
}

export default function BeneficiariesSummaryTable({ stats }: SummaryTableProps) {
  // Validar que tenemos datos
  if (!stats || !stats.by_department_details || !stats.by_program) {
    return (
      <Card className="mt-6">
        <Title>Tabla de Resumen por Departamento</Title>
        <Text className="text-red-500">No hay datos disponibles</Text>
      </Card>
    )
  }
  
  // Obtener lista de todos los programas que existen
  const allPrograms = Object.keys(stats.by_program)
  
  // Preparar datos dinámicamente por departamento
  const departmentData = Object.entries(stats.by_department_details)
    .map(([department, details]) => {
      return {
        department,
        total: details.total,
        masculine: details.masculino,
        feminine: details.femenino,
        programs: details.programs || {} // Desglose por programa
      }
    })
    .sort((a, b) => b.total - a.total)
  
  if (departmentData.length === 0) {
    return (
      <Card className="mt-6">
        <Title>Tabla de Resumen por Departamento</Title>
        <Text className="text-gray-500">No hay beneficiarios registrados</Text>
      </Card>
    )
  }

  // Función para descargar Excel
  const handleDownloadExcel = () => {
    try {
      // Build Excel columns dynamically
      const excelColumns: ExcelColumn[] = [
        { header: 'Departamento', key: 'department', width: 25 },
        { header: 'Población', key: 'total', width: 15 },
        { header: 'Femenino', key: 'feminine', width: 15 },
        { header: 'Masculino', key: 'masculine', width: 15 },
      ]

      // Add program columns
      allPrograms.forEach(program => {
        excelColumns.push({
          header: program,
          key: program,
          width: 20,
        })
      })

      // Build data rows
      const excelData = departmentData.map(row => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dataRow: any = {
          department: row.department,
          total: row.total,
          feminine: row.feminine,
          masculine: row.masculine,
        }

        // Add program values
        allPrograms.forEach(program => {
          dataRow[program] = row.programs[program] || 0
        })

        return dataRow
      })

      // Add totals row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalRow: any = {
        department: 'TOTAL',
        total: stats.total,
        feminine: stats.by_gender?.femenino || 0,
        masculine: stats.by_gender?.masculino || 0,
      }

      allPrograms.forEach(program => {
        totalRow[program] = stats.by_program[program] || 0
      })

      excelData.push(totalRow)

      // Export to Excel
      exportToExcel({
        fileName: 'resumen-beneficiarios',
        sheetName: 'Resumen por Departamento',
        columns: excelColumns,
        data: excelData,
        includeTimestamp: true,
      })

      toast.success('Resumen exportado a Excel')
    } catch {
      toast.error('Error al exportar el archivo')
    }
  }

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Title>Tabla de Resumen por Departamento</Title>
          <Text>Datos consolidados de beneficiarios</Text>
        </div>
        <Button onClick={handleDownloadExcel} className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="overflow-x-auto w-full">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Departamento</TableHead>
              <TableHead className="text-right whitespace-nowrap">Población</TableHead>
              <TableHead className="text-right whitespace-nowrap">Femenino</TableHead>
              <TableHead className="text-right whitespace-nowrap">Masculino</TableHead>
              {/* Headers dinámicos para cada programa */}
              {allPrograms.map(program => (
                <TableHead key={program} className="text-right whitespace-nowrap">{program}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentData.map((row) => (
              <TableRow key={row.department}>
                <TableCell className="font-medium whitespace-nowrap">{row.department}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{row.total}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{row.feminine}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{row.masculine}</TableCell>
                {/* Celdas dinámicas para cada programa */}
                {allPrograms.map(program => (
                  <TableCell key={program} className="text-right whitespace-nowrap">
                    {row.programs[program] || 0}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 font-bold">
              <TableCell className="whitespace-nowrap">TOTAL</TableCell>
              <TableCell className="text-right whitespace-nowrap">{stats.total}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{stats.by_gender?.femenino || 0}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{stats.by_gender?.masculino || 0}</TableCell>
              {/* Totales dinámicos para cada programa */}
              {allPrograms.map(program => (
                <TableCell key={program} className="text-right whitespace-nowrap">
                  {stats.by_program[program] || 0}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>* Los datos se calculan en tiempo real desde la base de datos</p>
      </div>
    </Card>
  )
}

