// app/api/user/profile/route.ts
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
        phone, address, city, state, zip_code,
        created_at, last_ip, user_agent,
        email_verified, role, permissions
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

    // Only return customer data
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Get customer stats
    const [stats] = (await query(
      `SELECT 
        COUNT(DISTINCT qr.id) as total_quotes,
        COUNT(DISTINCT CASE WHEN qr.status IN ('pending', 'in_progress') THEN qr.id END) as active_quotes,
        COUNT(DISTINCT t.id) as total_transactions,
        SUM(t.amount) as total_spent
      FROM users u
      LEFT JOIN quote_requests qr ON u.id = qr.user_id
      LEFT JOIN transactions t ON qr.id = t.quote_request_id
      WHERE u.id = ?
      GROUP BY u.id`,
      [user.id]
    )) as any[]

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zip_code: user.zip_code,
          email_verified: user.email_verified,
          created_at: user.created_at,
          role: user.role
        },
        stats: stats || {
          total_quotes: 0,
          active_quotes: 0,
          total_transactions: 0,
          total_spent: 0
        }
      }
    })

  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}