/**
 * Audits Configuration
 * Centralized configuration for audit-related forms and settings
 */

export const AUDITS_CONFIG = {
  /**
   * Form Template IDs for different audit forms
   */
  FORM_TEMPLATES: {
    /**
     * Consolidated Audits Board 2025
     * Used in: Tablero Consolidado section
     */
    CONSOLIDATED_BOARD_2025: '5bd783b6-e52c-48de-ab3b-9e7ae8538bd2',
  },

  /**
   * Traffic Light (Semáforo) configuration
   */
  TRAFFIC_LIGHT: {
    RED: 'Rojo',
    YELLOW: 'Amarillo',
    GREEN: 'Verde',
  },

  /**
   * Traffic Light Colors for charts and UI
   */
  TRAFFIC_LIGHT_COLORS: {
    RED: '#ef4444',
    YELLOW: '#eab308',
    GREEN: '#22c55e',
    UNDEFINED: '#94a3b8',
  },

  /**
   * Concluded status options
   */
  CONCLUDED_STATUS: {
    YES: 'Sí',
    NO: 'No',
  },

  /**
   * Board Extras table name
   */
  TABLES: {
    BOARD_EXTRAS: 'consolidated_board_extras',
    SUBMISSIONS: 'audits_submissions',
    ANSWERS: 'audits_answers',
  },
} as const

/**
 * Type-safe access to traffic light values
 */
export type TrafficLightValue = typeof AUDITS_CONFIG.TRAFFIC_LIGHT[keyof typeof AUDITS_CONFIG.TRAFFIC_LIGHT]

/**
 * Get the current active form template ID for consolidated board
 */
export function getConsolidatedBoardFormId(): string {
  return AUDITS_CONFIG.FORM_TEMPLATES.CONSOLIDATED_BOARD_2025
}

/**
 * Get the Tailwind CSS classes for a traffic light badge
 */
export function getTrafficLightBadgeClasses(trafficLight: string | null): string {
  switch (trafficLight) {
    case AUDITS_CONFIG.TRAFFIC_LIGHT.RED:
      return 'bg-red-100 text-red-800'
    case AUDITS_CONFIG.TRAFFIC_LIGHT.YELLOW:
      return 'bg-yellow-100 text-yellow-800'
    case AUDITS_CONFIG.TRAFFIC_LIGHT.GREEN:
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get the emoji for a traffic light status
 */
export function getTrafficLightEmoji(trafficLight: string | null): string {
  switch (trafficLight) {
    case AUDITS_CONFIG.TRAFFIC_LIGHT.RED:
      return '🔴'
    case AUDITS_CONFIG.TRAFFIC_LIGHT.YELLOW:
      return '🟡'
    case AUDITS_CONFIG.TRAFFIC_LIGHT.GREEN:
      return '🟢'
    default:
      return '⚪'
  }
}
