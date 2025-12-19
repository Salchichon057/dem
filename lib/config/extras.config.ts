export interface ExtrasTableConfig {
  tableName: string
  hasExtras: boolean
  apiEndpoint?: string
}

export const EXTRAS_TABLES_MAP: Record<string, ExtrasTableConfig> = {
  'auditorias': {
    tableName: 'consolidated_board_extras',
    hasExtras: true,
    apiEndpoint: '/api/board-extras',
  },
  'voluntariado': {
    tableName: 'volunteer_extras',
    hasExtras: true,
    apiEndpoint: '/api/volunteer-extras',
  },
  'organizaciones': {
    tableName: '',
    hasExtras: false,
  },
  'perfil-comunitario': {
    tableName: '',
    hasExtras: false,
  },
  'comunidades': {
    tableName: '',
    hasExtras: false,
  },
  'abrazando-leyendas': {
    tableName: '',
    hasExtras: false,
  },
}

export function getExtrasConfig(sectionLocation: string): ExtrasTableConfig {
  return EXTRAS_TABLES_MAP[sectionLocation]
}

export function hasExtrasTable(sectionLocation: string): boolean {
  return EXTRAS_TABLES_MAP[sectionLocation]?.hasExtras ?? false
}

export function getExtrasTableName(sectionLocation: string): string | null {
  const config = EXTRAS_TABLES_MAP[sectionLocation]
  return config?.hasExtras ? config.tableName : null
}

export function getExtrasApiEndpoint(sectionLocation: string): string | null {
  const config = EXTRAS_TABLES_MAP[sectionLocation]
  return config?.hasExtras ? config.apiEndpoint ?? null : null
}
