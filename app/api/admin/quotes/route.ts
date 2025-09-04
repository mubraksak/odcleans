import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let whereClause = ""
    const params: any[] = []

    if (status && status !== "all") {
      whereClause = "WHERE qr.status = ?"
      params.push(status)
    }

    // Get quotes with user information
    const quotesQuery = `
      SELECT qr.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             b.id as booking_id, b.scheduled_date, b.status as booking_status
      FROM quote_requests qr
      JOIN users u ON qr.user_id = u.id
      LEFT JOIN bookings b ON qr.id = b.quote_request_id
      ${whereClause}
      ORDER BY qr.created_at DESC
      LIMIT ? OFFSET ?
    `

    params.push(limit, offset)
    const quotes = (await query(quotesQuery, params)) as any[]

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM quote_requests qr ${whereClause}`
    const countParams = status && status !== "all" ? [status] : []
    const totalResult = (await query(countQuery, countParams)) as any[]
    const total = totalResult[0]?.total || 0

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 })
  }
}
