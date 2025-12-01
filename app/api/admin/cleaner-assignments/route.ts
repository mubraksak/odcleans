import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { quote_request_id, cleaner_id, payment_amount, admin_notes } = await request.json()

    // Check if already assigned
    const existingAssignment = (await query(
      "SELECT id FROM cleaner_assignments WHERE quote_request_id = ? AND status IN ('pending', 'accepted', 'in_progress')",
      [quote_request_id]
    )) as any[]

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { error: "This job is already assigned to a cleaner" },
        { status: 400 }
      )
    }

    // Create assignment
    const result = (await query(
      `INSERT INTO cleaner_assignments 
       (quote_request_id, cleaner_id, payment_amount, admin_notes, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [quote_request_id, cleaner_id, payment_amount, admin_notes || null]
    )) as any

    // Get cleaner and quote details for notification
    const assignmentDetails = (await query(
      `SELECT 
         c.id as cleaner_id, u.email as cleaner_email, u.name as cleaner_name,
         qr.id as quote_id, qr.total_price, cust.name as customer_name,
         b.scheduled_date, qr.cleaning_type, qr.property_type
       FROM cleaner_assignments ca
       JOIN cleaners c ON ca.cleaner_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN quote_requests qr ON ca.quote_request_id = qr.id
       JOIN users cust ON qr.user_id = cust.id
       LEFT JOIN bookings b ON qr.id = b.quote_request_id
       WHERE ca.id = ?`,
      [result.insertId]
    )) as any[]

    if (assignmentDetails.length > 0) {
      const details = assignmentDetails[0]
      
      // Send assignment notification to cleaner
      // try {
      //   await emailService.sendCleanerAssignmentNotification(
      //     details.cleaner_email,
      //     details.cleaner_name,
      //     details.quote_id,
      //     details.customer_name,
      //     details.scheduled_date,
      //     details.payment_amount || payment_amount,
      //     details.cleaning_type,
      //     details.property_type
      //   )
      // } catch (emailError) {
      //   console.error("Failed to send assignment email:", emailError)
      // }
    }

    return NextResponse.json({ 
      success: true, 
      assignmentId: result.insertId 
    })
  } catch (error) {
    console.error("Error assigning cleaner:", error)
    return NextResponse.json({ error: "Failed to assign cleaner" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    let whereClause = ""
    const params: any[] = []

    if (status !== "all") {
      whereClause = "WHERE ca.status = ?"
      params.push(status)
    }

    const assignmentsQuery = `
      SELECT 
        ca.*,
        c.business_name,
        c.phone as cleaner_phone,
        u.name as cleaner_name,
        u.email as cleaner_email,
        qr.id as quote_id,
        qr.cleaning_type,
        qr.property_type,
        qr.total_price,
        cust.name as customer_name,
        cust.email as customer_email,
        cust.phone as customer_phone,
        b.scheduled_date,
        b.status as booking_status
      FROM cleaner_assignments ca
      JOIN cleaners c ON ca.cleaner_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN quote_requests qr ON ca.quote_request_id = qr.id
      JOIN users cust ON qr.user_id = cust.id
      LEFT JOIN bookings b ON qr.id = b.quote_request_id
      ${whereClause}
      ORDER BY ca.assigned_date DESC
    `

    const assignments = (await query(assignmentsQuery, params)) as any[]

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}