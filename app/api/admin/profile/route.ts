// app/api/admin/profile/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify session and get user data
    const users = (await query(
      `SELECT 
        id, email, name, 
        phone, role, permissions,
        created_at, last_ip, user_agent,
        email_verified
      FROM users 
      WHERE session_token = ? AND session_expires > NOW()`,
      [sessionToken]
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const user = users[0]

    // Only return admin data
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Get system stats for admin
    const [systemStats] = (await query(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'cleaner') as total_cleaners,
        (SELECT COUNT(*) FROM cleaners WHERE status = 'approved') as approved_cleaners,
        (SELECT COUNT(*) FROM cleaners WHERE status = 'pending') as pending_cleaners,
        (SELECT COUNT(*) FROM quote_requests WHERE status IN ('pending', 'in_progress')) as active_quotes,
        (SELECT COUNT(*) FROM quote_requests WHERE status = 'completed') as completed_quotes,
        (SELECT SUM(amount) FROM transactions WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM cleaner_assignments WHERE status IN ('assigned', 'in_progress')) as active_assignments
      `
    )) as any[]

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          permissions: user.permissions,
          created_at: user.created_at,
          last_ip: user.last_ip,
          user_agent: user.user_agent,
          email_verified: user.email_verified,
          role: user.role
        },
        system_stats: systemStats || {
          total_customers: 0,
          total_cleaners: 0,
          approved_cleaners: 0,
          pending_cleaners: 0,
          active_quotes: 0,
          completed_quotes: 0,
          total_revenue: 0,
          active_assignments: 0
        }
      }
    })

  } catch (error) {
    console.error("Admin profile API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}