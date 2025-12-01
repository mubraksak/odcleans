import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { cookies } from "next/headers"
import { emailService } from "@/lib/email-service"
import { verifyCleanerSession } from "@/lib/session-utils"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("cleaner_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quote_request_id, action } = await request.json()
    const cleanerData = await verifyCleanerSession(sessionCookie.value)
    
    if (!cleanerData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cleanerId = cleanerData.id

    if (action === "request") {
      // Cleaner requests to work on a job
      const existingAssignment = (await query(
        "SELECT id FROM cleaner_assignments WHERE quote_request_id = ? AND cleaner_id = ?",
        [quote_request_id, cleanerId]
      )) as any[]

      if (existingAssignment.length > 0) {
        return NextResponse.json(
          { error: "You have already requested this job" },
          { status: 400 }
        )
      }

      await query(
        `INSERT INTO cleaner_assignments 
         (quote_request_id, cleaner_id, assigned_by, status) 
         VALUES (?, ?, ?, 'pending')`,
        [quote_request_id, cleanerId, cleanerId] // self-assigned
      )

      // Notify admin about cleaner's request
      await notifyAdminAboutCleanerRequest(quote_request_id, cleanerData)

    } else if (action === "accept" || action === "reject") {
      // Cleaner accepts/rejects an assigned job
      const assignment = (await query(
        `SELECT * FROM cleaner_assignments 
         WHERE quote_request_id = ? AND cleaner_id = ? AND status = 'pending'`,
        [quote_request_id, cleanerId]
      )) as any[]

      if (assignment.length === 0) {
        return NextResponse.json(
          { error: "Assignment not found" },
          { status: 404 }
        )
      }

      const newStatus = action === "accept"  ? "accepted" : "rejected" 
      
      await query(
        `UPDATE cleaner_assignments 
         SET status = ?, accepted_at = ? 
         WHERE quote_request_id = ? AND cleaner_id = ?`,
        [
          newStatus,
          action === "accept" ? new Date() : null,
          quote_request_id,
          cleanerId
        ]
      )
      


      // Update cleaner availability if accepted
      if (action === "accept") {
        await query(
          "UPDATE cleaners SET is_available = FALSE WHERE id = ?",
          [cleanerId]
        )
      }

      // Notify admin about cleaner's decision
      await notifyAdminAboutAssignmentDecision(quote_request_id, cleanerData, newStatus)
    }else if(action === "complete" || action === "reject"){
      // Cleaner marks job as completed
      const assignment = (await query(
        `SELECT * FROM cleaner_assignments 
         WHERE quote_request_id = ? AND cleaner_id = ? AND status = 'accepted'`,
        [quote_request_id, cleanerId]
      )) as any[]

      if (assignment.length === 0) {
        return NextResponse.json(
          { error: "Assignment not found or not accepted yet" },
          { status: 404 }
        )
      }

      const newStatus = action === "complete"  ? "completed" : "rejected"
      await query(
        `UPDATE cleaner_assignments 
         SET status = ?, completed_at = ? 
         WHERE quote_request_id = ? AND cleaner_id = ?`,
        [
          newStatus,
          action === "complete" ? new Date() : null,
          quote_request_id,
          cleanerId
        ]
      )

      // Update cleaner availability if completed
      if (action === "complete") {
        await query(
          "UPDATE cleaners SET is_available = TRUE WHERE id = ?",
          [cleanerId]
        )
      }

      if(action === "complete"){
        await query(
          `UPDATE bookings b
           JOIN quote_requests qr ON b.quote_request_id = qr.id
           SET b.status = 'completed', qr.status = 'completed'
           WHERE qr.id = ?`,
          [quote_request_id]
        )
      }

    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling cleaner assignment:", error)
    return NextResponse.json(
      { error: "Failed to process assignment" },
      { status: 500 }
    )
  }
}

async function notifyAdminAboutCleanerRequest(quoteId: number, cleaner: any) {
  try {
    const quoteDetails = (await query(
      `SELECT qr.*, u.name as customer_name 
       FROM quote_requests qr 
       JOIN users u ON qr.user_id = u.id 
       WHERE qr.id = ?`,
      [quoteId]
    )) as any[]

    if (quoteDetails.length > 0) {
      await emailService.sendCleanerJobRequestNotification(
        quoteId,
        quoteDetails[0].customer_name,
        cleaner.business_name || cleaner.name
      )
    }
  } catch (error) {
    console.error("Error notifying admin:", error)
  }
}

async function notifyAdminAboutAssignmentDecision(quoteId: number, cleaner: any, decision: string) {
  try {
    const quoteDetails = (await query(
      `SELECT qr.*, u.name as customer_name 
       FROM quote_requests qr 
       JOIN users u ON qr.user_id = u.id 
       WHERE qr.id = ?`,
      [quoteId]
    )) as any[]

    if (quoteDetails.length > 0) {
      await emailService.sendCleanerAssignmentDecisionNotification(
        quoteId,
        quoteDetails[0].customer_name,
        cleaner.business_name || cleaner.name,
        decision
      )
    }
  } catch (error) {
    console.error("Error notifying admin:", error)
  }
}