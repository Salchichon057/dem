 import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      submission_id,
      traffic_light,
      recommendations,
      follow_up_given,
      follow_up_date,
      concluded_result_red_or_no,
      solutions,
      preliminary_report,
      full_report,
    } = body

    // Validar submission_id
    if (!submission_id) {
      return NextResponse.json(
        { error: "submission_id es requerido" },
        { status: 400 }
      )
    }

    // Verificar si ya existe un registro
    const { data: existing } = await supabase
      .from("consolidated_board_extras")
      .select("id")
      .eq("submission_id", submission_id)
      .single()

    let result

    if (existing) {
      // Actualizar registro existente
      const { data, error } = await supabase
        .from("consolidated_board_extras")
        .update({
          traffic_light: traffic_light || null,
          recommendations: recommendations || null,
          follow_up_given: follow_up_given || false,
          follow_up_date: follow_up_date || null,
          concluded_result_red_or_no: concluded_result_red_or_no || null,
          solutions: solutions || null,
          preliminary_report: preliminary_report || null,
          full_report: full_report || null,
          updated_at: new Date().toISOString(),
        })
        .eq("submission_id", submission_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    } else {
      // Crear nuevo registro
      const { data, error } = await supabase
        .from("consolidated_board_extras")
        .insert({
          submission_id,
          traffic_light: traffic_light || null,
          recommendations: recommendations || null,
          follow_up_given: follow_up_given || false,
          follow_up_date: follow_up_date || null,
          concluded_result_red_or_no: concluded_result_red_or_no || null,
          solutions: solutions || null,
          preliminary_report: preliminary_report || null,
          full_report: full_report || null,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
