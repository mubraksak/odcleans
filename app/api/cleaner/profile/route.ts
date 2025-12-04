// app/api/cleaner/profile/route.ts
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
        phone, role, session_token
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

    // Only return cleaner data
    if (user.role !== 'cleaner') {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Get cleaner details from cleaners table
    const [cleaner] = (await query(
      `SELECT 
        c.*
      FROM cleaners c
      WHERE c.user_id = ?`,
      [user.id]
    )) as any[]

    if (!cleaner) {
      return NextResponse.json(
        { error: "Cleaner profile not found" },
        { status: 404 }
      )
    }

    // Get cleaner stats
    const [stats] = (await query(
      `SELECT 
        COUNT(DISTINCT ca.id) as total_assignments,
        COUNT(DISTINCT CASE WHEN ca.status IN ('assigned', 'in_progress') THEN ca.id END) as active_assignments,
        COUNT(DISTINCT CASE WHEN ca.status = 'completed' THEN ca.id END) as completed_assignments,
        SUM(CASE WHEN ca.payment_status = 'paid' THEN ca.payment_amount ELSE 0 END) as total_earnings,
        AVG(ca.rating) as average_rating
      FROM cleaners c
      LEFT JOIN cleaner_assignments ca ON c.id = ca.cleaner_id
      WHERE c.id = ?
      GROUP BY c.id`,
      [cleaner.id]
    )) as any[]

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        },
        cleaner: {
          id: cleaner.id,
          business_name: cleaner.business_name,
          phone: cleaner.phone,
          address: cleaner.address,
          service_areas: cleaner.service_areas,
          services_offered: cleaner.services_offered,
          experience_year: cleaner.experience_year,
          hourly_rate: cleaner.hourly_rate,
          status: cleaner.status,
          is_available: cleaner.is_available,
          rating: cleaner.rating,
          total_jobs: cleaner.total_jobs,
          created_at: cleaner.created_at,
          updated_at: cleaner.updated_at
        },
        stats: stats || {
          total_assignments: 0,
          active_assignments: 0,
          completed_assignments: 0,
          total_earnings: 0,
          average_rating: null
        }
      }
    })

  } catch (error) {
    console.error("Cleaner profile API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}