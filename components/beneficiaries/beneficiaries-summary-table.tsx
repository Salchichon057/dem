'use client'

import { BeneficiaryStats } from '@/lib/types'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    // Construir headers dinámicamente
    const headers = ['Departamento', 'Población', 'Femenino', 'Masculino', ...allPrograms]
    
    // Construir filas dinámicamente
    const rows = departmentData.map(row => [
      row.department,
      row.total,
      row.feminine,
      row.masculine,
      ...allPrograms.map(program => row.programs[program] || 0)
    ])

    // Construir CSV
    let csvContent = headers.join(',') + '\n'
    rows.forEach(row => {
      csvContent += row.join(',') + '\n'
    })

    // Agregar totales al final
    const programTotals = allPrograms.map(program => stats.by_program[program] || 0)
    const totalRow = [
      'TOTAL',
      stats.total,
      stats.by_gender?.femenino || 0,
      stats.by_gender?.masculino || 0,
      ...programTotals
    ]
    csvContent += totalRow.join(',') + '\n'

    // Crear blob y descargar
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `resumen-beneficiarios-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Title>Tabla de Resumen por Departamento</Title>
          <Text>Datos consolidados de beneficiarios</Text>
        </div>
        <Button onClick={handleDownloadExcel} className="gap-2">
          <Download className="w-4 h-4" />
          Descargar Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Departamento</TableHead>
              <TableHead className="text-right">Población</TableHead>
              <TableHead className="text-right">Femenino</TableHead>
              <TableHead className="text-right">Masculino</TableHead>
              {/* Headers dinámicos para cada programa */}
              {allPrograms.map(program => (
                <TableHead key={program} className="text-right">{program}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentData.map((row) => (
              <TableRow key={row.department}>
                <TableCell className="font-medium">{row.department}</TableCell>
                <TableCell className="text-right">{row.total}</TableCell>
                <TableCell className="text-right">{row.feminine}</TableCell>
                <TableCell className="text-right">{row.masculine}</TableCell>
                {/* Celdas dinámicas para cada programa */}
                {allPrograms.map(program => (
                  <TableCell key={program} className="text-right">
                    {row.programs[program] || 0}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 font-bold">
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right">{stats.total}</TableCell>
              <TableCell className="text-right">{stats.by_gender?.femenino || 0}</TableCell>
              <TableCell className="text-right">{stats.by_gender?.masculino || 0}</TableCell>
              {/* Totales dinámicos para cada programa */}
              {allPrograms.map(program => (
                <TableCell key={program} className="text-right">
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
