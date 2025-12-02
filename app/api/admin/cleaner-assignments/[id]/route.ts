import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { emailService } from "@/lib/email-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    //  Get assignment ID from params
    const { id } = await params
    const assignmentId = parseInt(id)

    // Fetch assignment details with joins
    const assignmentQuery = `
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
      WHERE ca.id = ?
    `

    const assignments = (await query(assignmentQuery, [assignmentId])) as any[]

    if (assignments.length === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({ assignment: assignments[0] })
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const assignmentId = parseInt(id)
    const body = await request.json()

    const { status, admin_notes, cleaner_notes, payment_amount, payment_status, payment_date } = body

    const updateFields = []
    const updateParams = []

    if (status !== undefined) {
      updateFields.push("status = ?")
      updateParams.push(status)
      
      // Set timestamps based on status
      if (status === "accepted") {
        updateFields.push("accepted_at = CURRENT_TIMESTAMP")
      } else if (status === "completed") {
        updateFields.push("completed_at = CURRENT_TIMESTAMP")

        query(
          `UPDATE bookings b
           JOIN cleaner_assignments ca ON b.quote_request_id = ca.quote_request_id
           SET b.status = 'completed'
           WHERE ca.id = ?`,
          [assignmentId]
        )

        query(
          `UPDATE quote_requests qr
           JOIN cleaner_assignments ca ON qr.id = ca.quote_request_id
           SET qr.status = 'completed'
           WHERE ca.id = ?`,
          [assignmentId]
        )
      }
    }
    
    // Update other fields
    if (admin_notes !== undefined) {
      updateFields.push("admin_notes = ?")
      updateParams.push(admin_notes)
    }
    
    // Update other fields
    if (cleaner_notes !== undefined) {
      updateFields.push("cleaner_notes = ?")
      updateParams.push(cleaner_notes)
    }
    // Update payment details
    if (payment_amount !== undefined) {
      updateFields.push("payment_amount = ?")
      updateParams.push(payment_amount)
    }
    // Update payment status and date
    if (payment_status !== undefined) {
      updateFields.push("payment_status = ?")
      updateParams.push(payment_status)
    }
    // Update payment status and date
    if (payment_date !== undefined) {
      updateFields.push("payment_date = ?")
      updateParams.push(payment_date)
    }

    updateParams.push(assignmentId)

    if (updateFields.length > 0) {
      await query(
        `UPDATE cleaner_assignments SET ${updateFields.join(", ")} WHERE id = ?`,
        updateParams
      )

      // Send email notifications based on changes
      if (status === "completed") {
        await notifyCleanerOfCompletion(assignmentId)
      }
      
      if (payment_status === "paid") {
        await notifyCleanerOfPayment(assignmentId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 })
  }
}

async function notifyCleanerOfCompletion(assignmentId: number) {
  try {
    const assignmentDetails = (await query(
      `SELECT ca.*, u.email as cleaner_email, u.name as cleaner_name,
              qr.id as quote_id, cust.name as customer_name
       FROM cleaner_assignments ca
       JOIN cleaners c ON ca.cleaner_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN quote_requests qr ON ca.quote_request_id = qr.id
       JOIN users cust ON qr.user_id = cust.id
       WHERE ca.id = ?`,
      [assignmentId]
    )) as any[]

    if (assignmentDetails.length > 0) {
      const assignment = assignmentDetails[0]
    //   await emailService.sendCleanerJobCompletedNotification(
    //     assignment.cleaner_email,
    //     assignment.cleaner_name,
    //     assignment.quote_id,
    //     assignment.customer_name
    //   )
    }
  } catch (error) {
    console.error("Error sending completion notification:", error)
  }
}

async function notifyCleanerOfPayment(assignmentId: number) {
  try {
    const assignmentDetails = (await query(
      `SELECT ca.*, u.email as cleaner_email, u.name as cleaner_name,
              qr.id as quote_id, ca.payment_amount
       FROM cleaner_assignments ca
       JOIN cleaners c ON ca.cleaner_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN quote_requests qr ON ca.quote_request_id = qr.id
       WHERE ca.id = ?`,
      [assignmentId]
    )) as any[]

    if (assignmentDetails.length > 0) {
      const assignment = assignmentDetails[0]
    //   await emailService.sendCleanerPaymentNotification(
    //     assignment.cleaner_email,
    //     assignment.cleaner_name,
    //     assignment.quote_id,
    //     assignment.payment_amount
    //   )
    }
  } catch (error) {
    console.error("Error sending payment notification:", error)
  }
}