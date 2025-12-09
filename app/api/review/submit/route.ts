// app/api/review/submit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, name, message, rating, serviceType } = body

    if (!token || !name || !message || !rating) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Get and validate token
    const [tokenData] = (await query(
      `SELECT * FROM review_tokens 
       WHERE token = ? AND used = false AND expires_at > NOW()`,
      [token]
    )) as any[]

    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired review link" },
        { status: 404 }
      )
    }

    // Start transaction
    // await query('START TRANSACTION')

    try {
      // Insert testimonial
      await query(
        `INSERT INTO testimonials (
          client_name, quote, rating, service_type, 
          user_id, quote_id, token, review_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [
          name,
          message,
          rating,
          serviceType || null,
          tokenData.user_id,
          tokenData.quote_id,
          token,
        ]
      )

      // Mark token as used
      await query(
        `UPDATE review_tokens SET used = true WHERE id = ?`,
        [tokenData.id]
      )

      // Update cleaner rating if applicable
      const [assignment] = (await query(
        `SELECT cleaner_id FROM cleaner_assignments 
         WHERE quote_request_id = ? AND status = 'completed'`,
        [tokenData.quote_id]
      )) as any[]

      if (assignment?.cleaner_id) {
        // Update cleaner's average rating
        await query(
          `UPDATE cleaners c
           SET rating = (
             SELECT AVG(t.rating) 
             FROM testimonials t
             JOIN cleaner_assignments ca ON t.quote_id = ca.quote_request_id
             WHERE ca.cleaner_id = ? AND ca.status = 'completed'
           )
           WHERE c.id = ?`,
          [assignment.cleaner_id, assignment.cleaner_id]
        )
      }

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: "Review submitted successfully"
      })

    } catch (error) {
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error("Submit review error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}