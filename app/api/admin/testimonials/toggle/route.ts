// app/api/admin/testimonials/toggle/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/database"

// PUT - Toggle testimonial active status
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify admin session
    const users = (await query(
      `SELECT id FROM admin_users 
       WHERE session_token = ? AND session_expires > NOW() AND role = 'admin'`,
      [sessionToken]
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, isActive } = body

    if (!id || isActive === undefined) {
      return NextResponse.json(
        { error: "ID and isActive are required" },
        { status: 400 }
      )
    }

    // Check if testimonial exists
    const [testimonial] = (await query(
      `SELECT id FROM testimonials WHERE id = ?`,
      [id]
    )) as any[]

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      )
    }

    // Update status
    await query(
      `UPDATE testimonials SET 
        is_active = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [isActive, id]
    )

    return NextResponse.json({
      success: true,
      message: `Testimonial ${isActive ? 'activated' : 'deactivated'} successfully`
    })

  } catch (error) {
    console.error("Toggle testimonial error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}