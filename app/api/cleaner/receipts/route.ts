import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { emailService } from "@/lib/email-service"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("cleaner_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cleanerData = await getCleanerFromSession(sessionCookie.value)
    if (!cleanerData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get("assignment_id")

    let queryStr = `
      SELECT 
        ca.*,
        qr.id as quote_id,
        qr.cleaning_type,
        qr.property_type,
        qr.total_price as quote_total,
        cust.name as customer_name,
        cust.email as customer_email,
        cust.phone as customer_phone,
        b.scheduled_date,
        u.name as cleaner_name,
        u.email as cleaner_email,
        c.business_name
      FROM cleaner_assignments ca
      JOIN quote_requests qr ON ca.quote_request_id = qr.id
      JOIN users cust ON qr.user_id = cust.id
      JOIN cleaners c ON ca.cleaner_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN bookings b ON qr.id = b.quote_request_id
      WHERE ca.cleaner_id = ?
    `

    const params: any[] = [cleanerData.id]

    if (assignmentId) {
      queryStr += " AND ca.id = ?"
      params.push(parseInt(assignmentId))
    } else {
      queryStr += " AND ca.payment_status = 'paid'"
    }

    queryStr += " ORDER BY ca.payment_date DESC"

    const receipts = (await query(queryStr, params)) as any[]

    return NextResponse.json({ receipts })
  } catch (error) {
    console.error("Error fetching receipts:", error)
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { assignment_id } = await request.json()

    // Get assignment details
    const assignmentDetails = (await query(
      `SELECT 
         ca.*, c.user_id, u.email as cleaner_email, u.name as cleaner_name,
         qr.total_price, cust.name as customer_name, b.scheduled_date,
         qr.cleaning_type, qr.property_type
       FROM cleaner_assignments ca
       JOIN cleaners c ON ca.cleaner_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN quote_requests qr ON ca.quote_request_id = qr.id
       JOIN users cust ON qr.user_id = cust.id
       LEFT JOIN bookings b ON qr.id = b.quote_request_id
       WHERE ca.id = ?`,
      [assignment_id]
    )) as any[]

    if (assignmentDetails.length === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const assignment = assignmentDetails[0]

    // Send receipt email to cleaner
    await emailService.sendCleanerReceipt(
      assignment.cleaner_email,
      assignment.cleaner_name,
      assignment.id,
      assignment.payment_amount,
      {
        customerName: assignment.customer_name,
        serviceDate: assignment.scheduled_date,
        serviceType: assignment.cleaning_type,
        propertyType: assignment.property_type
      }
    )

    return NextResponse.json({ success: true, message: "Receipt sent successfully" })
  } catch (error) {
    console.error("Error sending receipt:", error)
    return NextResponse.json({ error: "Failed to send receipt" }, { status: 500 })
  }
}

// Helper function (same as before)
async function getCleanerFromSession(sessionToken: string) {
  try {
    const user = (await query(
      `SELECT u.*, c.*, c.id as cleaner_id 
       FROM users u 
       JOIN cleaners c ON u.id = c.user_id 
       WHERE u.session_token = ? AND u.role = 'cleaner'`,
      [sessionToken]
    )) as any[]
    
    return user[0] || null
  } catch (error) {
    return null
  }
}