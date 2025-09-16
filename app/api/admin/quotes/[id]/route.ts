import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth-utils"
import { emailService } from "@/lib/email-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
     const resolvedParams = await params // Await the params promise
    const quoteId = resolvedParams.id

    // Get quote with user details
    const quotes = (await query(
      `SELECT qr.*, u.name as user_name, u.email as user_email, u.phone as user_phone, u.address as user_address,
              b.id as booking_id, b.scheduled_date, b.status as booking_status, b.completed_at
       FROM quote_requests qr
       JOIN users u ON qr.user_id = u.id
       LEFT JOIN bookings b ON qr.id = b.quote_request_id
       WHERE qr.id = ?`,
      [quoteId],
    )) as any[]

    if (quotes.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    return NextResponse.json({ quote: quotes[0] })
  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 })
  }
}

// In your PATCH function in /api/admin/quotes/[id]/route.ts
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const resolvedParams = await params
    const quoteId = resolvedParams.id
    const updates = await request.json()

    const { status, base_price, total_price, admin_notes, additional_services } = updates

    // Build update query dynamically
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (status) {
      updateFields.push("status = ?")
      updateValues.push(status)
    }

    if (total_price !== undefined) {
      updateFields.push("total_price = ?")
      updateValues.push(total_price)
    }

    if (base_price !== undefined) {
      updateFields.push("base_price = ?")
      updateValues.push(base_price)
    }

    if (admin_notes !== undefined) {
      updateFields.push("admin_notes = ?")
      updateValues.push(admin_notes)
    }

    // if (additional_services !== undefined) {
    //   updateFields.push("additional_services = ?")
    //   updateValues.push(additional_services)
    // }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    updateValues.push(quoteId)
    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    
    const updateQuery = `UPDATE quote_requests SET ${updateFields.join(", ")} WHERE id = ?`
    await query(updateQuery, updateValues)


    // If quote is accepted, send acceptance emails
    if (status === "accepted") {
      const quote = (await query("SELECT * FROM quote_requests WHERE id = ?", [quoteId])) as any[]
      if (quote.length > 0) {
        try {
          // Send to user
          emailService.sendQuoteAcceptedUser(quote[0].contact_email, quote[0].contact_name, Number(quoteId), )
            .catch(err => console.error("Failed to send user acceptance email:", err))
          
          // Send to admin
          emailService.sendQuoteAcceptedAdmin( quote[0].contact_email, quote[0].contact_name, Number(quoteId), )
            .catch(err => console.error("Failed to send admin acceptance email:", err))
        } catch (emailError) {
          console.error("Email sending error:", emailError)
          // Don't fail the request if emails fail
        }
      }
    }


    if (status === "quoted") {
      const quote = (await query("SELECT * FROM quote_requests WHERE id = ?", [quoteId])) as any[]
      if (quote.length > 0) {
        try {
          // Send to user
          emailService.sendQuoteCreatedUser(Number(quoteId) , quote[0].contact_name, quote[0].contact_email, total_price)
            .catch(err => console.error("Failed to send user acceptance email:", err))
          
          // Send to admin
          emailService.sendQuoteCreatedAdmin(Number(quoteId), quote[0].contact_name, quote[0].contact_email, total_price ) 
            .catch(err => console.error("Failed to send admin acceptance email:", err))
        } catch (emailError) {
          console.error("Email sending error:", emailError)
          // Don't fail the request if emails fail
        }
      }
    }


//  // Send quote creation emails (non-blocking)
//     try {
//       // Send to user
//       emailService.sendQuoteCreatedUser(userEmail, userName, quoteId, price)
//         .catch(err => console.error("Failed to send user quote email:", err))
      
//       // Send to admin (confirmation)
//       emailService.sendQuoteCreatedAdmin(quoteId, userName, userEmail, price)
//         .catch(err => console.error("Failed to send admin confirmation email:", err))
//     } catch (emailError) {
//       console.error("Email sending error:", emailError)
//       // Don't fail the request if emails fail
//     }

    

    return NextResponse.json({ success: true, message: "Quote updated successfully" })
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 })
  }
}