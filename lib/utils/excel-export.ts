import * as XLSX from 'xlsx'

/**
 * Utility to export data to Excel (.xlsx) format
 * Supports Spanish characters (tildes, ñ, etc.)
 */

export interface ExcelColumn {
  header: string
  key: string
  width?: number
}

export interface ExcelExportOptions {
  fileName: string
  sheetName?: string
  columns: ExcelColumn[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  includeTimestamp?: boolean
}

/**
 * Export data to Excel file
 */
export function exportToExcel(options: ExcelExportOptions): void {
  const {
    fileName,
    sheetName = 'Datos',
    columns,
    data,
    includeTimestamp = true,
  } = options

  // Prepare headers
  const headers = columns.map(col => col.header)

  // Prepare rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key]
      
      // Handle different data types
      if (value === null || value === undefined) return ''
      if (typeof value === 'boolean') return value ? 'Sí' : 'No'
      if (value instanceof Date) return value.toLocaleDateString('es-GT')
      if (typeof value === 'object') {
        // Handle arrays
        if (Array.isArray(value)) return value.join(', ')
        // Handle objects
        return JSON.stringify(value)
      }
      
      return value
    })
  })

  // Create worksheet data
  const worksheetData = [headers, ...rows]

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Set column widths
  const columnWidths = columns.map(col => ({
    wch: col.width || 20 // default width
  }))
  worksheet['!cols'] = columnWidths

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate file name with timestamp if requested
  const timestamp = includeTimestamp 
    ? `_${new Date().toISOString().split('T')[0]}`
    : ''
  const fullFileName = `${fileName}${timestamp}.xlsx`

  // Write file
  XLSX.writeFile(workbook, fullFileName)
}

/**
 * Export multiple sheets to a single Excel file
 */
export interface MultiSheetExportOptions {
  fileName: string
  sheets: Array<{
    name: string
    columns: ExcelColumn[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
  }>
  includeTimestamp?: boolean
}

export function exportMultiSheetExcel(options: MultiSheetExportOptions): void {
  const { fileName, sheets, includeTimestamp = true } = options

  // Create workbook
  const workbook = XLSX.utils.book_new()

  // Add each sheet
  sheets.forEach(sheet => {
    const headers = sheet.columns.map(col => col.header)
    const rows = sheet.data.map(item => {
      return sheet.columns.map(col => {
        const value = item[col.key]
        if (value === null || value === undefined) return ''
        if (typeof value === 'boolean') return value ? 'Sí' : 'No'
        if (value instanceof Date) return value.toLocaleDateString('es-GT')
        if (typeof value === 'object') {
          if (Array.isArray(value)) return value.join(', ')
          return JSON.stringify(value)
        }
        return value
      })
    })

    const worksheetData = [headers, ...rows]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Set column widths
    const columnWidths = sheet.columns.map(col => ({
      wch: col.width || 20
    }))
    worksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })

  // Generate file name
  const timestamp = includeTimestamp 
    ? `_${new Date().toISOString().split('T')[0]}`
    : ''
  const fullFileName = `${fileName}${timestamp}.xlsx`

  // Write file
  XLSX.writeFile(workbook, fullFileName)
}
