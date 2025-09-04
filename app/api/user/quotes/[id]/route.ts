import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth-utils"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, scheduledDate } = await request.json()
    const quoteId = params.id

    // Verify quote belongs to user
    const quotes = (await query("SELECT * FROM quote_requests WHERE id = ? AND user_id = ?", [
      quoteId,
      user.id,
    ])) as any[]

    if (quotes.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const quote = quotes[0]

    if (action === "accept") {
      // Update quote status to accepted
      await query("UPDATE quote_requests SET status = 'accepted' WHERE id = ?", [quoteId])

      // Create booking if scheduled date is provided
      if (scheduledDate) {
        await query("INSERT INTO bookings (quote_request_id, scheduled_date, status) VALUES (?, ?, 'confirmed')", [
          quoteId,
          scheduledDate,
        ])
      }

      return NextResponse.json({ success: true, message: "Quote accepted successfully" })
    } else if (action === "decline") {
      // Update quote status to declined
      await query("UPDATE quote_requests SET status = 'declined' WHERE id = ?", [quoteId])

      return NextResponse.json({ success: true, message: "Quote declined" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 })
  }
}
