import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""

    let whereClause = ""
    const params: any[] = []

    if (status && status !== "all") {
      whereClause = "WHERE t.status = ?"
      params.push(status)
    }

    if (search) {
      if (whereClause) {
        whereClause += " AND (t.customer_name LIKE ? OR t.customer_email LIKE ? OR t.stripe_payment_intent_id LIKE ?)"
      } else {
        whereClause = "WHERE (t.customer_name LIKE ? OR t.customer_email LIKE ? OR t.stripe_payment_intent_id LIKE ?)"
      }
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const transactionsQuery = `
      SELECT 
        t.*,
        qr.property_type,
        qr.cleaning_type,
        qr.bedrooms,
        qr.bathrooms,
        qr.square_footage
      FROM transactions t
      LEFT JOIN quote_requests qr ON t.quote_id = qr.id
      ${whereClause}
      ORDER BY t.created_at DESC
    `

    const transactions = (await query(transactionsQuery, params)) as any[]

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}