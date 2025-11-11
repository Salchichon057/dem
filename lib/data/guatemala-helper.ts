import guatemalaData from './guatemala.json'

export interface Departamento {
  nombre: string
  municipios: string[]
}

/**
 * Obtiene todos los departamentos de Guatemala
 */
export function getDepartamentos(): string[] {
  return guatemalaData.departamentos.map(d => d.nombre)
}

/**
 * Obtiene todos los municipios de un departamento específico
 */
export function getMunicipiosByDepartamento(departamento: string): string[] {
  const dept = guatemalaData.departamentos.find(
    d => d.nombre.toLowerCase() === departamento.toLowerCase()
  )
  return dept ? dept.municipios : []
}

/**
 * Obtiene todos los departamentos con sus municipios
 */
export function getAllDepartamentos(): Departamento[] {
  return guatemalaData.departamentos
}

/**
 * Verifica si un departamento existe
 */
export function departamentoExists(departamento: string): boolean {
  return guatemalaData.departamentos.some(
    d => d.nombre.toLowerCase() === departamento.toLowerCase()
  )
}

/**
 * Verifica si un municipio existe en un departamento
 */
export function municipioExists(departamento: string, municipio: string): boolean {
  const dept = guatemalaData.departamentos.find(
    d => d.nombre.toLowerCase() === departamento.toLowerCase()
  )
  
  if (!dept) return false
  
  return dept.municipios.some(
    m => m.toLowerCase() === municipio.toLowerCase()
  )
}

/**
 * Busca departamentos por nombre (útil para autocomplete)
 */
export function searchDepartamentos(query: string): string[] {
  const lowerQuery = query.toLowerCase()
  return guatemalaData.departamentos
    .filter(d => d.nombre.toLowerCase().includes(lowerQuery))
    .map(d => d.nombre)
}

/**
 * Busca municipios en un departamento (útil para autocomplete)
 */
export function searchMunicipios(departamento: string, query: string): string[] {
  const dept = guatemalaData.departamentos.find(
    d => d.nombre.toLowerCase() === departamento.toLowerCase()
  )
  
  if (!dept) return []
  
  const lowerQuery = query.toLowerCase()
  return dept.municipios.filter(m => m.toLowerCase().includes(lowerQuery))
}
