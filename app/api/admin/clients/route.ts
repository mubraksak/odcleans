import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let whereClause = ""
    const params: any[] = []

    if (search) {
      whereClause = "WHERE u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? "
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    // Get clients with quote statistics
    const clientsQuery = `
      SELECT u.*, 
             COUNT(qr.id) as total_quotes,
             COUNT(CASE WHEN qr.status = 'scheduled' THEN 1 END) as accepted_quotes,
             SUM(CASE WHEN qr.status = 'scheduled' THEN qr.total_price ELSE 0 END) as total_spent,
             MAX(qr.created_at) as last_quote_date
      FROM users u 
      LEFT JOIN quote_requests qr ON u.id = qr.user_id
      ${whereClause} WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC 
      LIMIT ? OFFSET ? 
    `

    params.push(limit, offset)
    const clients = (await query(clientsQuery, params)) as any[]

    // Get total count
    const countQuery = `SELECT COUNT(DISTINCT u.id) as total FROM users u ${whereClause}`
    const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
    const totalResult = (await query(countQuery, countParams)) as any[]
    const total = totalResult[0]?.total || 0

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}
