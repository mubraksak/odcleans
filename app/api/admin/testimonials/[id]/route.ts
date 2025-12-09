// app/api/admin/testimonials/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/database"

// GET single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify admin session
    const users = (await query(
      `SELECT id FROM admin_users 
       WHERE session_token = ? AND session_expires > NOW() AND role = 'admin'`,
      [sessionToken]
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)

    // Get testimonial with related data
    const [testimonial] = (await query(
      `SELECT 
        t.*,
        u.email as user_email,
        u.name as user_full_name,
        qr.service_type as quote_service_type,
        qr.scheduled_date,
        qr.completed_date,
        c.business_name as cleaner_business_name,
        c.contact_name as cleaner_contact_name
      FROM testimonials t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN quote_requests qr ON t.quote_id = qr.id
      LEFT JOIN cleaner_assignments ca ON qr.id = ca.quote_request_id AND ca.status = 'completed'
      LEFT JOIN cleaners c ON ca.cleaner_id = c.id
      WHERE t.id = ?`,
      [id]
    )) as any[]

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: testimonial
    })

  } catch (error) {
    console.error("Get testimonial error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify admin session
    const users = (await query(
      `SELECT id FROM users 
       WHERE session_token = ? AND session_expires > NOW() AND role = 'admin'`,
      [sessionToken]
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)
    const body = await request.json()

    // Check if testimonial exists
    const [existingTestimonial] = (await query(
      `SELECT id FROM testimonials WHERE id = ?`,
      [id]
    )) as any[]

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      )
    }

    // Validate rating if provided
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Build update query dynamically
    const updateFields = []
    const updateValues = []

    if (body.client_name !== undefined) {
      updateFields.push("client_name = ?")
      updateValues.push(body.client_name)
    }

    if (body.quote !== undefined) {
      updateFields.push("quote = ?")
      updateValues.push(body.quote)
    }

    if (body.rating !== undefined) {
      updateFields.push("rating = ?")
      updateValues.push(body.rating)
    }

    if (body.service_type !== undefined) {
      updateFields.push("service_type = ?")
      updateValues.push(body.service_type)
    }

    if (body.image_url !== undefined) {
      updateFields.push("image_url = ?")
      updateValues.push(body.image_url)
    }

    if (body.display_order !== undefined) {
      updateFields.push("display_order = ?")
      updateValues.push(body.display_order)
    }

    if (body.is_active !== undefined) {
      updateFields.push("is_active = ?")
      updateValues.push(body.is_active)
    }

    if (body.user_id !== undefined) {
      updateFields.push("user_id = ?")
      updateValues.push(body.user_id)
    }

    if (body.quote_id !== undefined) {
      updateFields.push("quote_id = ?")
      updateValues.push(body.quote_id)
    }

    if (body.review_date !== undefined) {
      updateFields.push("review_date = ?")
      updateValues.push(body.review_date)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    updateFields.push("updated_at = NOW()")
    updateValues.push(id)

    // Update testimonial
    await query(
      `UPDATE testimonials SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    )

    // Get updated testimonial
    const [updatedTestimonial] = (await query(
      `SELECT * FROM testimonials WHERE id = ?`,
      [id]
    )) as any[]

    return NextResponse.json({
      success: true,
      message: "Testimonial updated successfully",
      data: updatedTestimonial
    })

  } catch (error) {
    console.error("Update testimonial error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Remove testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify admin session
    const users = (await query(
      `SELECT id FROM users 
       WHERE session_token = ? AND session_expires > NOW() AND role = 'admin'`,
      [sessionToken]
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)

    // Check if testimonial exists
    const [testimonial] = (await query(
      `SELECT id FROM testimonials WHERE id = ?`,
      [id]
    )) as any[]

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      )
    }

    // Delete testimonial
    await query(
      `DELETE FROM testimonials WHERE id = ?`,
      [id]
    )

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully"
    })

  } catch (error) {
    console.error("Delete testimonial error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}