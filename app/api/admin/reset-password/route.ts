/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const DEFAULT_PASSWORD = "userABC123++"

export async function POST(request: NextRequest) {
  try {
    const supabase = await import("@/lib/supabase/server").then(m => m.createClient())
    
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role:roles!users_role_id_fkey(name)')
      .eq('id', currentUser.id)
      .single()

    const userRole = (userProfile?.role as any)?.name
    if (userRole !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
    }

    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Service role key not configured" }, { status: 500 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: DEFAULT_PASSWORD }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Contraseña reseteada a: ${DEFAULT_PASSWORD}`,
      defaultPassword: DEFAULT_PASSWORD
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
