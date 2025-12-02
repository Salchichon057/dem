import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { BoardExtra, MonthlyTrafficLightData, BoardExtraStats } from "@/lib/types"
import { AUDITS_CONFIG } from "@/lib/config/audits.config"

const LAST_MONTHS_TO_SHOW = 6

/**
 * Count board extras by traffic light status
 */
function countByTrafficLight(extras: BoardExtra[]) {
  return {
    red: extras.filter(e => e.traffic_light === AUDITS_CONFIG.TRAFFIC_LIGHT.RED).length,
    yellow: extras.filter(e => e.traffic_light === AUDITS_CONFIG.TRAFFIC_LIGHT.YELLOW).length,
    green: extras.filter(e => e.traffic_light === AUDITS_CONFIG.TRAFFIC_LIGHT.GREEN).length,
    undefined: extras.filter(e => !e.traffic_light).length,
  }
}

/**
 * Count board extras by follow-up status
 */
function countByFollowUp(extras: BoardExtra[]) {
  return {
    with_follow_up: extras.filter(e => e.follow_up_given === true).length,
    without_follow_up: extras.filter(e => e.follow_up_given === false).length,
  }
}

/**
 * Count board extras by concluded status
 */
function countByConcluded(extras: BoardExtra[]) {
  return {
    yes: extras.filter(e => e.concluded_result_red_or_no === AUDITS_CONFIG.CONCLUDED_STATUS.YES).length,
    no: extras.filter(e => e.concluded_result_red_or_no === AUDITS_CONFIG.CONCLUDED_STATUS.NO).length,
    undefined: extras.filter(e => !e.concluded_result_red_or_no).length,
  }
}

/**
 * Group board extras by month and count traffic light statuses
 */
function groupByMonth(extras: BoardExtra[]): MonthlyTrafficLightData[] {
  const monthlyData = extras.reduce((acc: MonthlyTrafficLightData[], item: BoardExtra) => {
    if (!item.audits_submissions?.submitted_at) return acc
    
    const date = new Date(item.audits_submissions.submitted_at)
    const month = date.toLocaleDateString('es-GT', { year: 'numeric', month: 'short' })
    
    let monthData = acc.find(m => m.month === month)
    if (!monthData) {
      monthData = { month, red: 0, yellow: 0, green: 0 }
      acc.push(monthData)
    }
    
    if (item.traffic_light === AUDITS_CONFIG.TRAFFIC_LIGHT.RED) monthData.red++
    else if (item.traffic_light === AUDITS_CONFIG.TRAFFIC_LIGHT.YELLOW) monthData.yellow++
    else if (item.traffic_light === AUDITS_CONFIG.TRAFFIC_LIGHT.GREEN) monthData.green++
    
    return acc
  }, [])

  // Sort by date and take last N months
  monthlyData.sort((a, b) => {
    const dateA = new Date(a.month)
    const dateB = new Date(b.month)
    return dateA.getTime() - dateB.getTime()
  })
  
  return monthlyData.slice(-LAST_MONTHS_TO_SHOW)
}

/**
 * GET /api/board-extras/stats
 * Returns statistics about board extras (audit tracking)
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: extras, error } = await supabase
      .from("consolidated_board_extras")
      .select(`
        *,
        audits_submissions!inner (
          submitted_at
        )
      `)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const boardExtras = (extras || []) as BoardExtra[]
    const trafficLightCounts = countByTrafficLight(boardExtras)
    const followUpCounts = countByFollowUp(boardExtras)
    const concludedCounts = countByConcluded(boardExtras)
    const monthlyData = groupByMonth(boardExtras)

    const stats: BoardExtraStats = {
      total: boardExtras.length,
      red: trafficLightCounts.red,
      yellow: trafficLightCounts.yellow,
      green: trafficLightCounts.green,
      undefined: trafficLightCounts.undefined,
      by_month: monthlyData,
      follow_up: {
        with_follow_up: followUpCounts.with_follow_up,
        without_follow_up: followUpCounts.without_follow_up,
      },
      concluded: {
        yes: concludedCounts.yes,
        no: concludedCounts.no,
        undefined: concludedCounts.undefined,
      },
    }

    return NextResponse.json(stats)
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

