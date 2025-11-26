import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Obtener todos los extras con sus submissions
    const { data: extras, error } = await supabase
      .from("consolidated_board_extras")
      .select(`
        *,
        audits_submissions!inner (
          submitted_at
        )
      `)

    if (error) {
      console.error("Error fetching board extras stats:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total = extras?.length || 0
    
    // Contar por tipo de semáforo
    const rojo = extras?.filter(e => e.traffic_light === 'Rojo').length || 0
    const amarillo = extras?.filter(e => e.traffic_light === 'Amarillo').length || 0
    const verde = extras?.filter(e => e.traffic_light === 'Verde').length || 0
    const sin_definir = extras?.filter(e => !e.traffic_light).length || 0

    // Seguimiento
    const con_seguimiento = extras?.filter(e => e.follow_up_given === true).length || 0
    const sin_seguimiento = extras?.filter(e => e.follow_up_given === false).length || 0

    // Concluidos
    const concluidos_si = extras?.filter(e => e.concluded_result_red_or_no === 'Sí').length || 0
    const concluidos_no = extras?.filter(e => e.concluded_result_red_or_no === 'No').length || 0
    const concluidos_sin_definir = extras?.filter(e => !e.concluded_result_red_or_no).length || 0

    // Agrupar por mes (últimos 6 meses)
    const porMes = extras?.reduce((acc: any[], item: any) => {
      if (!item.audits_submissions?.submitted_at) return acc
      
      const date = new Date(item.audits_submissions.submitted_at)
      const mes = date.toLocaleDateString('es-GT', { year: 'numeric', month: 'short' })
      
      let mesData = acc.find(m => m.mes === mes)
      if (!mesData) {
        mesData = { mes, rojo: 0, amarillo: 0, verde: 0 }
        acc.push(mesData)
      }
      
      if (item.traffic_light === 'Rojo') mesData.rojo++
      else if (item.traffic_light === 'Amarillo') mesData.amarillo++
      else if (item.traffic_light === 'Verde') mesData.verde++
      
      return acc
    }, []) || []

    // Ordenar por fecha y tomar últimos 6 meses
    porMes.sort((a, b) => {
      const dateA = new Date(a.mes)
      const dateB = new Date(b.mes)
      return dateA.getTime() - dateB.getTime()
    })
    const ultimosSeisMeses = porMes.slice(-6)

    const stats = {
      total,
      rojo,
      amarillo,
      verde,
      sin_definir,
      por_mes: ultimosSeisMeses,
      seguimiento: {
        con_seguimiento,
        sin_seguimiento,
      },
      concluidos: {
        si: concluidos_si,
        no: concluidos_no,
        sin_definir: concluidos_sin_definir,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in GET /api/board-extras/stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
