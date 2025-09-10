import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth-utils"
import { emailService } from "@/lib/email-service"

// GET endpoint to fetch quote details with additional services
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: quoteId } = await params

    // Verify quote belongs to user and fetch quote details
    const quotes = (await query(
      "SELECT * FROM quote_requests WHERE id = ? AND user_id = ?",
      [quoteId, user.id]
    )) as any[]

    if (quotes.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Fetch additional services from quote_additional_services table
    const additionalServices = (await query(
      "SELECT * FROM quote_additional_services WHERE quote_id = ? ORDER BY id",
      [quoteId]
    )) as any[]

    const quote = quotes[0]

    return NextResponse.json({
      quote: {
        ...quote,
        additional_services: additionalServices
      }
    })
  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 })
  }
}

// PATCH endpoint to update quote with counter offer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("PATCH request received")
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: quoteId } = await params
    console.log("Quote ID:", quoteId)

    const body = await request.json()
    console.log("Request body:", body)

    const { action, scheduledDate, suggested_price, user_notes, additional_services, new_total_price } = body

    // Verify quote belongs to user
     // Verify quote belongs to user and get quote details
    const quotes = (await query(
      "SELECT qr.*, u.email as user_email, u.name as user_name FROM quote_requests qr JOIN users u ON qr.user_id = u.id WHERE qr.id = ? AND qr.user_id = ?", 
      [quoteId, user.id]
    )) as any[]

    if (quotes.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const quote = quotes[0]

  if (action === "accept") {
  // Update the quote status
  await query("UPDATE quote_requests SET status = 'accepted' WHERE id = ?", [quoteId]);

  // Check if booking already exists
  const existingBookings = (await query(
    "SELECT id FROM bookings WHERE quote_request_id = ?",
    [quoteId]
  )) as any[];

  // If booking exists, delete it
  if (existingBookings.length > 0) {
    await query(
      "DELETE FROM bookings WHERE quote_request_id = ?",
      [quoteId]
    );
  }

  // Create new booking record
  await query(
    "INSERT INTO bookings (quote_request_id, status) VALUES (?, 'pending_schedule')",
    [quoteId]
  );

    // Send acceptance emails (non-blocking)
      try {
        // Send to user
        emailService.sendQuoteAcceptedUser(quote.customer_email, quote.customer_name, Number(quoteId), scheduledDate)
          .catch(err => console.error("Failed to send user acceptance email:", err))
        
        // Send to admin
        emailService.sendQuoteAcceptedAdmin(Number(quoteId), quote.customer_name, quote.customer_email, scheduledDate)
          .catch(err => console.error("Failed to send admin acceptance email:", err))
      } catch (emailError) {
        console.error("Email sending error:", emailError)
        // Don't fail the request if emails fail
      }


  return NextResponse.json({
    success: true,
    message: "Quote accepted successfully"
  });
}else if (action === "decline") {
      // Update quote status to declined
      await query("UPDATE quote_requests SET status = 'declined' WHERE id = ?", [quoteId])

      return NextResponse.json({ success: true, message: "Quote declined" })
    } else if (action === "counter_offer") {
      
      const validStatus = "quoted"

      // await query("START TRANSACTION")

      try {
        // Update the main quote with suggested price, user notes, and NEW total price
        await query(
          "UPDATE quote_requests SET suggested_price = ?, user_notes = ?, total_price = ?, status = ? WHERE id = ?",
          [suggested_price, user_notes, new_total_price, validStatus, quoteId]
        )

        // Remove existing additional services
        await query("DELETE FROM quote_additional_services WHERE quote_id = ?", [quoteId])

        // Insert new additional services if provided
        if (additional_services && additional_services.trim() !== '') {
          const services = additional_services.split(',').map((serviceStr: string) => {
            const [service_type, priceStr] = serviceStr.split(':')
            return {
              service_type: service_type.trim(),
              price: parseFloat(priceStr) || 0
            }
          }).filter((service: { service_type: any; price: number }) => service.service_type && !isNaN(service.price))

          for (const service of services) {
            await query(
              "INSERT INTO quote_additional_services (quote_id, service_type, price) VALUES (?, ?, ?)",
              [quoteId, service.service_type, service.price]
            )
          }
        }

        await query("COMMIT")
        return NextResponse.json({ success: true, message: "Counter offer submitted" })
      } catch (error) {
        await query("ROLLBACK")
        console.error("Transaction error:", error)
        throw error
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 })
  }
}