import { FormSectionType } from '@/lib/types'

export interface ExtrasTableConfig {
  tableName: string
  hasExtras: boolean
  apiEndpoint?: string
}

export const EXTRAS_TABLES_MAP: Record<FormSectionType, ExtrasTableConfig> = {
  [FormSectionType.AUDITORIAS]: {
    tableName: 'consolidated_board_extras',
    hasExtras: true,
    apiEndpoint: '/api/board-extras',
  },
  [FormSectionType.VOLUNTARIADO]: {
    tableName: 'volunteer_extras',
    hasExtras: true,
    apiEndpoint: '/api/volunteer-extras',
  },
  [FormSectionType.ORGANIZACIONES]: {
    tableName: '',
    hasExtras: false,
  },
  [FormSectionType.PERFIL_COMUNITARIO]: {
    tableName: '',
    hasExtras: false,
  },
  [FormSectionType.COMUNIDADES]: {
    tableName: '',
    hasExtras: false,
  },
  [FormSectionType.ABRAZANDO_LEYENDAS]: {
    tableName: '',
    hasExtras: false,
  },
}

export function getExtrasConfig(sectionLocation: FormSectionType): ExtrasTableConfig {
  return EXTRAS_TABLES_MAP[sectionLocation]
}

export function hasExtrasTable(sectionLocation: FormSectionType): boolean {
  return EXTRAS_TABLES_MAP[sectionLocation]?.hasExtras ?? false
}

export function getExtrasTableName(sectionLocation: FormSectionType): string | null {
  const config = EXTRAS_TABLES_MAP[sectionLocation]
  return config?.hasExtras ? config.tableName : null
}

export function getExtrasApiEndpoint(sectionLocation: FormSectionType): string | null {
  const config = EXTRAS_TABLES_MAP[sectionLocation]
  return config?.hasExtras ? config.apiEndpoint ?? null : null
}
