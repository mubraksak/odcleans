import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth-utils"
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's quotes with customer details
    const quotes = (await query(
      `SELECT 
        qr.*, 
        u.email as customer_email,
        u.name as customer_name,
        b.id as booking_id, 
        b.scheduled_date, 
        b.status as booking_status,
        GROUP_CONCAT(CONCAT(qas.service_type, ':', COALESCE(asp.base_price, 0)) SEPARATOR ';') as additional_services
      FROM quote_requests qr
      JOIN users u ON qr.user_id = u.id
      LEFT JOIN bookings b ON qr.id = b.quote_request_id
      LEFT JOIN quote_additional_services qas ON qr.id = qas.quote_id
      LEFT JOIN additional_service_pricing asp ON qas.service_type = asp.name AND asp.is_active = TRUE
      WHERE qr.user_id = ?
      GROUP BY qr.id, u.id, b.id, b.scheduled_date, b.status
      ORDER BY qr.created_at DESC`,
      [user.id],
    )) as any[]

    // Parse the additional services
    const parsedQuotes = quotes.map(quote => ({
      ...quote,
      customer_email: quote.customer_email || user.email,
      customer_name: quote.customer_name || user.name,
      additional_services: quote.additional_services 
        ? quote.additional_services.split(';').map((service: string) => {
            const [service_type, price] = service.split(':')
            return { service_type, price: parseFloat(price) }
          })
        : []
    }))

    return NextResponse.json({ quotes: parsedQuotes })
  } catch (error) {
    console.error("Error fetching user quotes:", error)
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 })
  }
}