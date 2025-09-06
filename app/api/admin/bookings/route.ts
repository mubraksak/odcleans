import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { quote_id, scheduled_date, status } = await request.json()

    // Create booking
    // const result = await query(
    //   `INSERT INTO bookings (quote_request_id, scheduled_date, status) 
    //    VALUES (?, ?, ?)`,
    //   [quote_id, scheduled_date, status]
    // ) as any

    const result = await query(
      `UPDATE  bookings SET scheduled_date = ?, status =? WHERE quote_request_id = ?`,
      [ scheduled_date, status, quote_id]
    ) as any


    // Update quote status to scheduled
    await query(
      `UPDATE quote_requests SET status = 'scheduled' WHERE id = ?`,
      [quote_id]
    )

    return NextResponse.json({ 
      success: true, 
      bookingId: result.insertId 
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" }, 
      { status: 500 }
    )
  }
}