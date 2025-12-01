import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { emailService } from "@/lib/email-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let whereClause = ""
    const params: any[] = []

    if (status !== "all") {
      whereClause = "WHERE c.status = ?"
      params.push(status)
    }

    const cleanersQuery = `
      SELECT 
        c.*,
        u.email,
        u.name as user_name,
        u.phone as user_phone,
        COUNT(ca.id) as total_assignments,
        COUNT(CASE WHEN ca.status = 'completed' THEN 1 END) as completed_assignments,
        AVG(cr.rating) as avg_rating
      FROM cleaners c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN cleaner_assignments ca ON c.id = ca.cleaner_id
      LEFT JOIN cleaner_reviews cr ON c.id = cr.cleaner_id
      ${whereClause}
      GROUP BY c.id, u.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `

    params.push(limit, offset)
    const cleaners = (await query(cleanersQuery, params)) as any[]

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM cleaners c ${whereClause}`
    const countParams = status !== "all" ? [status] : []
    const totalResult = (await query(countQuery, countParams)) as any[]
    const total = totalResult[0]?.total || 0

    return NextResponse.json({
      cleaners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching cleaners:", error)
    return NextResponse.json({ error: "Failed to fetch cleaners" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { cleanerId, status, adminNotes } = await request.json()

    // Update cleaner status
    await query(
      "UPDATE cleaners SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, adminNotes, cleanerId]
    )

    // Get cleaner details for email notification
    const cleanerDetails = (await query(
      `SELECT c.*, u.email, u.name 
       FROM cleaners c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = ?`,
      [cleanerId]
    )) as any[]

    if (cleanerDetails.length > 0) {
      const cleaner = cleanerDetails[0]
      
      // Send status update email to cleaner
      try {
        await emailService.sendCleanerStatusUpdate(
          cleaner.email,
          cleaner.name,
          status,
          adminNotes
        )
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating cleaner status:", error)
    return NextResponse.json({ error: "Failed to update cleaner status" }, { status: 500 })
  }
}