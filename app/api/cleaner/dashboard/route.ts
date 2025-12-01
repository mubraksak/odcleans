import { NextResponse } from "next/server"
import { query } from "@/lib/database"
import { cookies } from "next/headers"
import { verifyCleanerSession } from "@/lib/session-utils"
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("cleaner_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get cleaner ID from session (you'll need to implement session parsing)
    const cleanerData = await verifyCleanerSession(sessionCookie.value)
    if (!cleanerData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cleanerId = cleanerData.id

    // Get dashboard metrics
    const assignedJobs = (await query(
      `SELECT COUNT(*) as count FROM cleaner_assignments 
       WHERE cleaner_id = ? AND status IN ('pending', 'accepted')`,
      [cleanerId]
    )) as any[]

    const completedJobs = (await query(
      `SELECT COUNT(*) as count FROM cleaner_assignments 
       WHERE cleaner_id = ? AND status = 'completed'`,
      [cleanerId]
    )) as any[]

    const totalEarnings = (await query(
      `SELECT COALESCE(SUM(payment_amount), 0) as total FROM cleaner_assignments 
       WHERE cleaner_id = ? AND payment_status = 'paid'`,
      [cleanerId]
    )) as any[]

    // Get available jobs (quotes that are paid/scheduled but not assigned)
    const availableJobs = (await query(
      `SELECT qr.*, u.name as customer_name, u.email as customer_email, 
              u.phone as customer_phone, b.scheduled_date
       FROM quote_requests qr
       JOIN users u ON qr.user_id = u.id
       LEFT JOIN bookings b ON qr.id = b.quote_request_id
       LEFT JOIN cleaner_assignments ca ON qr.id = ca.quote_request_id AND ca.status  IN ('pending', 'accepted')
       WHERE qr.status IN ('paid', 'scheduled') 
       AND ca.id IS NULL
       AND b.scheduled_date >= CURDATE()
       ORDER BY b.scheduled_date ASC
       LIMIT 10`
    )) as any[]

    // Get cleaner's current assignments
    const currentAssignments = (await query(
      `SELECT ca.*, qr.*, u.name as customer_name, u.email as customer_email,
              b.scheduled_date, b.status as booking_status, ca.status as assignment_status
       FROM cleaner_assignments ca
       JOIN quote_requests qr ON ca.quote_request_id = qr.id
       JOIN users u ON qr.user_id = u.id
       LEFT JOIN bookings b ON qr.id = b.quote_request_id
       WHERE ca.cleaner_id = ? AND ca.status IN ('pending', 'accepted')
       ORDER BY b.scheduled_date ASC`,
      [cleanerId]
    )) as any[]

    return NextResponse.json({
      metrics: {
        assignedJobs: assignedJobs[0]?.count || 0,
        completedJobs: completedJobs[0]?.count || 0,
        totalEarnings: totalEarnings[0]?.total || 0,
      },
      availableJobs,
      currentAssignments,
      cleaner: cleanerData
    })
  } catch (error) {
    console.error("Error fetching cleaner dashboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}

// Helper function to get cleaner from session
async function getCleanerFromSession(sessionToken: string) {
  try {
    // Implement your session verification logic here
    // This is a simplified example
    const user = (await query(
      `SELECT u.*, c.*, c.id as cleaner_id 
       FROM users u 
       JOIN cleaners c ON u.id = c.user_id 
       WHERE u.session_token = ? AND u.role = 'cleaner'`,
      [sessionToken]
    )) as any[]
    
    return user[0] || null
  } catch (error) {
    return null
  }
}