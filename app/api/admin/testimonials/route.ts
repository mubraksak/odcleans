// app/api/admin/testimonials/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/database"

// GET all testimonials with pagination and filtering
export async function GET(request: NextRequest) {
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
      `SELECT id, role FROM admin_users 
       WHERE session_token = ? AND session_expires > NOW()`,
      [sessionToken]
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const user = users[0]
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required" },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'active', 'inactive', or null for all
    const search = searchParams.get('search') // Search in client_name or quote
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const offset = (page - 1) * limit

    // Build WHERE conditions
    const conditions: string[] = []
    const params: any[] = []

    if (status === 'active') {
      conditions.push("t.is_active = ?")
      params.push(true)
    } else if (status === 'inactive') {
      conditions.push("t.is_active = ?")
      params.push(false)
    }

    if (search) {
      conditions.push("(t.client_name LIKE ? OR t.quote LIKE ?)")
      params.push(`%${search}%`, `%${search}%`)
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : ''

    // Validate sort column to prevent SQL injection
    const validSortColumns = [
      'id', 'client_name', 'rating', 'service_type', 
      'review_date', 'created_at', 'updated_at', 'display_order'
    ]
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    // Get total count
    const [countResult] = (await query(
      `SELECT COUNT(*) as total FROM testimonials t ${whereClause}`,
      params
    )) as any[]

    const total = countResult.total
    const totalPages = Math.ceil(total / limit)

    // Get testimonials
    const testimonials = (await query(
      `SELECT 
        t.id,
        t.client_name,
        t.quote,
        t.rating,
        t.service_type,
        t.image_url,
        t.display_order,
        t.is_active,
        t.user_id,
        t.quote_id,
        t.review_date,
        t.created_at,
        t.updated_at,
        u.email as user_email,
        qr.service_type as quote_service_type,
        b.scheduled_date,
        b.completed_at,
        c.business_name as cleaner_business_name
      FROM testimonials t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN quote_requests qr ON t.quote_id = qr.id
      LEFT JOIN cleaner_assignments ca ON qr.id = ca.quote_request_id AND ca.status = 'completed'
      LEFT JOIN cleaners c ON ca.cleaner_id = c.id
      LEFT JOIN bookings b ON qr.id = b.id
      ${whereClause}
      ORDER BY t.${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )) as any[]

    // Get statistics
    const [stats] = (await query(
      `SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_reviews,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews
      FROM testimonials`
    )) as any[]

    return NextResponse.json({
      success: true,
      data: {
        testimonials,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        statistics: {
          totalReviews: stats?.total_reviews || 0,
          activeReviews: stats?.active_reviews || 0,
          inactiveReviews: stats?.inactive_reviews || 0,
          averageRating: stats?.average_rating ? parseFloat(stats.average_rating).toFixed(1) : "0.0",
          fiveStarReviews: stats?.five_star_reviews || 0,
          positiveReviews: stats?.positive_reviews || 0,
          positivePercentage: stats?.total_reviews 
            ? Math.round((stats.positive_reviews / stats.total_reviews) * 100)
            : 0
        }
      }
    })

  } catch (error) {
    console.error("Get testimonials error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a new testimonial (admin manual entry)
export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Validate required fields
    if (!body.client_name || !body.quote || !body.rating) {
      return NextResponse.json(
        { error: "Client name, quote, and rating are required" },
        { status: 400 }
      )
    }

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Get max display_order to add new one at the end
    const [maxOrder] = (await query(
      `SELECT COALESCE(MAX(display_order), 0) as max_order FROM testimonials`
    )) as any[]

    const displayOrder = maxOrder.max_order + 1

    // Insert testimonial
    const result = (await query(
      `INSERT INTO testimonials (
        client_name,
        quote,
        rating,
        service_type,
        image_url,
        display_order,
        is_active,
        user_id,
        quote_id,
        review_date,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        body.client_name,
        body.quote,
        body.rating,
        body.service_type || null,
        body.image_url || null,
        displayOrder,
        body.is_active !== undefined ? body.is_active : true,
        body.user_id || null,
        body.quote_id || null,
        body.review_date || new Date().toISOString().split('T')[0]
      ]
    )) as any

    const testimonialId = result.insertId

    // Get the newly created testimonial
    const [newTestimonial] = (await query(
      `SELECT * FROM testimonials WHERE id = ?`,
      [testimonialId]
    )) as any[]

    return NextResponse.json({
      success: true,
      message: "Testimonial created successfully",
      data: newTestimonial
    })

  } catch (error) {
    console.error("Create testimonial error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}