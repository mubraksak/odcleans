import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { quote_id, scheduled_date, status } = await request.json()

    // Create booking
    // const result = await query(
    //   `INSERT INTO bookings (quote_request_id, scheduled_date, status) 
    //    VALUES (?, ?, ?)`,
    //   [quote_id, scheduled_date, status]
    // ) as any


    // First, get user details for email notification
    const userDetails = (await query(
      `SELECT u.email, u.name, qr.id as quote_id 
       FROM quote_requests qr 
       JOIN users u ON qr.user_id = u.id 
       WHERE qr.id = ?`,
      [quote_id]
    )) as any[]

    if (userDetails.length === 0) {
      return NextResponse.json(
        { error: "Quote not found" }, 
        { status: 404 }
      )
    }

    const userEmail = userDetails[0].email
    const userName = userDetails[0].name
    const quoteId = userDetails[0].quote_id


    // Update booking
    const result = await query(
      `UPDATE  bookings SET scheduled_date = ?, status =? WHERE quote_request_id = ?`,
      [ scheduled_date, status, quote_id]
    ) as any


    // Update quote status to scheduled
    await query(
      `UPDATE quote_requests SET status = 'scheduled' WHERE id = ?`,
      [quote_id]
    )




    // Send scheduling emails (non-blocking)
    try {
      // Send to user
      emailService.sendBookingScheduledUser(userEmail, userName, quoteId, scheduled_date)
        .catch(err => console.error("Failed to send user scheduling email:", err))
      
      // Send to admin
      emailService.sendBookingScheduledAdmin(quoteId, userName, userEmail, scheduled_date)
        .catch(err => console.error("Failed to send admin scheduling email:", err))
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Don't fail the request if emails fail
    }

    


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


