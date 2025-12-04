import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    // Get metrics for the dashboard
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Requests this week
    const requestsThisWeek = (await query("SELECT COUNT(*) as count FROM quote_requests WHERE created_at >= ?", [
      weekAgo,
    ])) as any[]

    // Total revenue (accepted quotes)
    const revenueResult = (await query(
      "SELECT SUM(total_price) as total FROM quote_requests WHERE (status ='accepted' OR status = 'paid' OR status = 'scheduled' OR status = 'completed') AND total_price IS NOT NULL",
    )) as any[] 

    // Upcoming cleanings (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const upcomingCleanings = (await query(
      "SELECT COUNT(*) as count FROM bookings WHERE scheduled_date BETWEEN ? AND ? AND (status = 'scheduled' OR status = 'accepted' OR status = 'in_progress' OR status = 'comfirmed')",
      [now, nextWeek],
    )) as any[]

    // Recent quotes for activity feed
    const recentQuotes = (await query(
      `SELECT qr.*, u.name as user_name, u.email as user_email 
       FROM quote_requests qr 
       JOIN users u ON qr.user_id = u.id 
       ORDER BY qr.created_at DESC 
       LIMIT 10`,
    )) as any[]

    // Status distribution
    const statusStats = (await query("SELECT status, COUNT(*) as count FROM quote_requests GROUP BY status")) as any[]

    return NextResponse.json({
      metrics: {
        requestsThisWeek: requestsThisWeek[0]?.count || 0,
        totalRevenue: revenueResult[0]?.total || 0,
        upcomingCleanings: upcomingCleanings[0]?.count || 0,
      },
      recentQuotes,
      statusStats,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
