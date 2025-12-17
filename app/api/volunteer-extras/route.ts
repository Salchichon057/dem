import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      submission_id,
      total_hours,
      receives_benefit,
      benefit_number,
      agricultural_pounds,
      unit_cost_q,
      unit_cost_usd,
      viveres_bags,
      average_cost_30lbs,
      picking_gtq,
      picking_5lbs,
      total_amount_q,
      group_number,
    } = body

    if (!submission_id) {
      return NextResponse.json(
        { error: "submission_id es requerido" },
        { status: 400 }
      )
    }

    if (!total_hours || total_hours <= 0 || total_hours > 24) {
      return NextResponse.json(
        { error: "total_hours debe estar entre 0 y 24" },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from("volunteer_extras")
      .select("id")
      .eq("submission_id", submission_id)
      .single()

    let result

    if (existing) {
      const { data, error } = await supabase
        .from("volunteer_extras")
        .update({
          total_hours,
          receives_benefit: receives_benefit ?? false,
          benefit_number: benefit_number ?? null,
          agricultural_pounds: agricultural_pounds ?? 0,
          unit_cost_q: unit_cost_q ?? null,
          unit_cost_usd: unit_cost_usd ?? null,
          viveres_bags: viveres_bags ?? null,
          average_cost_30lbs: average_cost_30lbs ?? null,
          picking_gtq: picking_gtq ?? null,
          picking_5lbs: picking_5lbs ?? null,
          total_amount_q: total_amount_q ?? null,
          group_number: group_number ?? null,
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
      const { data, error } = await supabase
        .from("volunteer_extras")
        .insert({
          submission_id,
          total_hours,
          receives_benefit: receives_benefit ?? false,
          benefit_number: benefit_number ?? null,
          agricultural_pounds: agricultural_pounds ?? 0,
          unit_cost_q: unit_cost_q ?? null,
          unit_cost_usd: unit_cost_usd ?? null,
          viveres_bags: viveres_bags ?? null,
          average_cost_30lbs: average_cost_30lbs ?? null,
          picking_gtq: picking_gtq ?? null,
          picking_5lbs: picking_5lbs ?? null,
          total_amount_q: total_amount_q ?? null,
          group_number: group_number ?? null,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
