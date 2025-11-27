'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'

interface DateFilterProps {
  selectedYear: string
  selectedMonth: string
  onYearChange: (year: string) => void
  onMonthChange: (month: string) => void
  yearLabel?: string
  monthLabel?: string
  showIcons?: boolean
  className?: string
}

export default function DateFilter({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  yearLabel = 'Año',
  monthLabel = 'Mes',
  showIcons = true,
  className = ''
}: DateFilterProps) {
  // Generar años desde 2020 hasta el año actual + 1
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2020 + i)

  const months = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ]

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-full md:w-32">
          {showIcons && <Calendar className="w-4 h-4 mr-2" />}
          <SelectValue placeholder={yearLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los años</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={selectedMonth} 
        onValueChange={onMonthChange}
        disabled={selectedYear === 'all'}
      >
        <SelectTrigger className="w-full md:w-36">
          {showIcons && <Calendar className="w-4 h-4 mr-2" />}
          <SelectValue placeholder={monthLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los meses</SelectItem>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
