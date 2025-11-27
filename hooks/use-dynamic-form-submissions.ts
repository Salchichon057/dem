import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface FormOption {
  id: string
  name: string
}

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

interface UseDynamicFormSubmissionsProps {
  sectionLocation: string
}

export function useDynamicFormSubmissions({ sectionLocation }: UseDynamicFormSubmissionsProps) {
  // Forms list
  const [forms, setForms] = useState<FormOption[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>('none')
  const [formName, setFormName] = useState<string>('')
  
  // Table data
  const [columns, setColumns] = useState<ColumnDefinition[]>([])
  const [data, setData] = useState<SubmissionRow[]>([])
  const [filteredData, setFilteredData] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  
  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})

  // Load forms list for this section
  useEffect(() => {
    fetchForms()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionLocation])

  const fetchForms = async () => {
    try {
      const response = await fetch(`/api/formularios?section=${sectionLocation}`)
      const result = await response.json()
      
      if (response.ok) {
        const formsData = result.forms || []
        setForms(formsData)
      } else {
        toast.error('Error al cargar formularios')
      }
    } catch (error) {
      toast.error('Error al cargar formularios')
    }
  }

  // Load submissions when form is selected
  useEffect(() => {
    if (selectedFormId && selectedFormId !== 'none') {
      fetchSubmissions()
    } else {
      setColumns([])
      setData([])
      setFilteredData([])
      setFormName('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormId])

  const fetchSubmissions = async () => {
    if (!selectedFormId || selectedFormId === 'none') return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/submissions/${selectedFormId}`)
      const result = await response.json()
      
      if (response.ok) {
        setFormName(result.formName)
        setColumns(result.columns)
        setData(result.data)
        setFilteredData(result.data)
        
        // Initialize column visibility (all visible by default)
        const initialVisibility: Record<string, boolean> = {
          user_name: true,
          user_email: true,
          submitted_at: true,
        }
        result.columns.forEach((col: ColumnDefinition) => {
          initialVisibility[col.id] = true
        })
        setVisibleColumns(initialVisibility)
        
      } else {
        toast.error('Error al cargar envíos')
      }
    } catch (error) {
      toast.error('Error al cargar envíos')
    } finally {
      setLoading(false)
    }
  }

  // Search and date filters
  useEffect(() => {
    let filtered = data
    
    // Apply search filter
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
    
    // Apply date filter (submitted_at)
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
    setCurrentPage(1) // Reset to page 1 on filter change
  }, [searchTerm, selectedYear, selectedMonth, data, columns])

  // Pagination
  useEffect(() => {
    const total = Math.ceil(filteredData.length / itemsPerPage)
    setTotalPages(total || 1)
  }, [filteredData, itemsPerPage])

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Column visibility helpers
  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }))
  }

  const toggleAllColumns = () => {
    const allChecked = Object.values(visibleColumns).every(v => v)
    const newState: Record<string, boolean> = {}
    Object.keys(visibleColumns).forEach(key => {
      newState[key] = !allChecked
    })
    setVisibleColumns(newState)
  }

  const allColumnsChecked = Object.values(visibleColumns).every(v => v)

  return {
    // State
    forms,
    selectedFormId,
    formName,
    columns,
    data,
    filteredData,
    paginatedData,
    loading,
    currentPage,
    totalPages,
    itemsPerPage,
    searchTerm,
    selectedYear,
    selectedMonth,
    visibleColumns,
    allColumnsChecked,
    
    // Actions
    setSelectedFormId,
    setSearchTerm,
    setSelectedYear,
    setSelectedMonth,
    setCurrentPage,
    toggleColumn,
    toggleAllColumns,
  }
}
