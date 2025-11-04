import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth-utils"
import { emailService } from "@/lib/email-service"

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

    // Verify quote belongs to user and fetch quote details with customer data
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
      WHERE qr.id = ? AND qr.user_id = ?
      GROUP BY qr.id, u.id, b.id, b.scheduled_date, b.status`,
      [quoteId, user.id]
    )) as any[]

    if (quotes.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const quote = quotes[0]

    return NextResponse.json({
      quote: {
        ...quote,
        // Ensure customer data is properly formatted
        customer_email: quote.customer_email || user.email,
        customer_name: quote.customer_name || user.name,
        additional_services: quote.additional_services 
          ? quote.additional_services.split(';').map((service: string) => {
              const [service_type, price] = service.split(':')
              return { service_type, price: parseFloat(price) }
            })
          : []
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
    const quotess = (await query(
      "SELECT qr.*, u.email as user_email, u.name as user_name FROM quote_requests qr JOIN users u ON qr.user_id = u.id WHERE qr.id = ? AND qr.user_id = ?", 
      [quoteId, user.id]
    )) as any[]

    if (quotess.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const quotee = quotess[0]

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
        emailService.sendQuoteAcceptedUser(quotee.customer_email, quotee.customer_name, Number(quoteId), scheduledDate)
          .catch(err => console.error("Failed to send user acceptance email:", err))
        
        // Send to admin
        emailService.sendQuoteAcceptedAdmin(quotee.customer_email, quotee.customer_name, Number(quoteId), scheduledDate)
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
    // Add to your PATCH function
else if (action === "payment_success") {
  const { payment_intent_id, amount, customer_email, customer_name } = body
  
  console.log("🔄 Processing payment success for quote:", {
    quoteId,
    payment_intent_id,
    amount
  })

  try {
    // Remove transaction commands - execute queries individually
    // 1. Update quote status to 'paid'
    await query(
      "UPDATE quote_requests SET status = 'paid', updated_at = NOW() WHERE id = ?",
      [quoteId]
    )

    // 2. Record transaction in database
    if (payment_intent_id) {
      await query(
        `INSERT INTO transactions (
          quote_id, 
          stripe_payment_intent_id, 
          amount, 
          currency, 
          status, 
          customer_email,
          customer_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          quoteId,
          payment_intent_id,
          amount || quotee.total_price || 0,
          'usd',
          'succeeded',
          customer_email || quotee.customer_email,
          customer_name || quotee.customer_name
        ]
      )
    }

    // 3. Update booking status if exists, or create one
    const existingBookings = await query(
      "SELECT id FROM bookings WHERE quote_request_id = ?",
      [quoteId]
    ) as any[]

    if (existingBookings.length > 0) {
      await query(
        "UPDATE bookings SET status = 'confirmed' WHERE quote_request_id = ?",
        [quoteId]
      )
    } else {
      await query(
        "INSERT INTO bookings (quote_request_id, status) VALUES (?, 'confirmed')",
        [quoteId]
      )
    }

    console.log("✅ Quote status updated to paid and transaction recorded")

    return NextResponse.json({ 
      success: true, 
      message: "Payment recorded successfully",
      quote_id: quoteId
    })

  } catch (error) {
    console.error("❌ Error updating quote status:", error)
    return NextResponse.json(
      { error: "Failed to update quote status" },
      { status: 500 }
    )
  }
}

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 })
  }
}