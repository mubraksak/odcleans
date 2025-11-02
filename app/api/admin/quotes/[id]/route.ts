import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quoteId = parseInt(id)

    const quoteQuery = `
      SELECT 
        qr.*, 
        u.name as user_name, 
        u.email as user_email, 
        u.phone as user_phone,
        b.id as booking_id, 
        b.scheduled_date, 
        b.status as booking_status,
        GROUP_CONCAT(CONCAT(qas.service_type, ':', COALESCE(asp.base_price, 0)) SEPARATOR ';') as additional_services
      FROM quote_requests qr
      JOIN users u ON qr.user_id = u.id
      LEFT JOIN bookings b ON qr.id = b.quote_request_id
      LEFT JOIN quote_additional_services qas ON qr.id = qas.quote_id
      LEFT JOIN additional_service_pricing asp ON qas.service_type = asp.name AND asp.is_active = TRUE
      WHERE qr.id = ?
      GROUP BY qr.id, u.id, b.id
    `

    const quotes = (await query(quoteQuery, [quoteId])) as any[]

    if (quotes.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    return NextResponse.json({ quote: quotes[0] })
  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quoteId = parseInt(id)
    const body = await request.json()

    // Check if quote is scheduled
    const currentQuote = (await query(
      "SELECT status FROM quote_requests WHERE id = ?",
      [quoteId]
    )) as any[]

    if (currentQuote.length > 0 && currentQuote[0].status === "scheduled") {
      return NextResponse.json(
        { error: "Cannot update a scheduled quote" },
        { status: 400 }
      )
    }

    const { base_price, total_price, admin_notes, status, additional_services } = body

    const updateFields = []
    const updateParams = []

    if (base_price !== undefined) {
      updateFields.push("base_price = ?")
      updateParams.push(base_price)
    }
    if (total_price !== undefined) {
      updateFields.push("total_price = ?")
      updateParams.push(total_price)
    }
    if (admin_notes !== undefined) {
      updateFields.push("admin_notes = ?")
      updateParams.push(admin_notes)
    }
    if (status !== undefined) {
      updateFields.push("status = ?")
      updateParams.push(status)
    }

    updateParams.push(quoteId)

    if (updateFields.length > 0) {
      await query(
        `UPDATE quote_requests SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateParams
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 })
  }
}