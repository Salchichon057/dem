import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const supabase = await createClient()
    const { submissionId } = params

    const { data, error } = await supabase
      .from("consolidated_board_extras")
      .select("*")
      .eq("submission_id", submissionId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No encontrado - retornar 404
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      console.error("Error fetching board extras:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/board-extras/[submissionId]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
