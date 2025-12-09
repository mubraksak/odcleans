// app/api/admin/testimonials/route.ts - UPDATED
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/database"

// Debug helper function
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Admin Testimonials API] ${message}`, data || '');
  }
}

// GET all testimonials with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    debugLog("=== STARTING GET REQUEST ===");
    
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    debugLog("Session token from cookie:", sessionToken ? "EXISTS" : "MISSING");
    
    if (!sessionToken) {
      debugLog("No session token found, returning 401");
      return NextResponse.json(
        { error: "Unauthorized - No session token" },
        { status: 401 }
      )
    }

    // First check: Verify the session token exists
    debugLog("Verifying session token in database...");
    const users = (await query(
      `SELECT id, email, role, session_expires FROM admin_users 
       WHERE session_token = ?`,
      [sessionToken]
    )) as any[]

    debugLog(`Found ${users.length} user(s) with this token`);
    
    if (users.length === 0) {
      debugLog("No user found with this session token");
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const user = users[0]
    debugLog("User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
      session_expires: user.session_expires
    });

    // Check if session is expired
    if (new Date(user.session_expires) < new Date()) {
      debugLog("Session expired");
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    debugLog(`Checking user role: ${user.role}`);
    if (user.role !== 'admin') {
      debugLog(`User is not admin. Role: ${user.role}`);
      return NextResponse.json(
        { error: "Access denied. Admin privileges required" },
        { status: 403 }
      )
    }

    debugLog("Admin authentication successful!");

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'active', 'inactive', or null for all
    const search = searchParams.get('search') // Search in client_name or quote
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const offset = (page - 1) * limit

    debugLog("Query parameters:", {
      page, limit, status, search, sortBy, sortOrder, offset
    });

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
    debugLog("Getting total count...");
    const [countResult] = (await query(
      `SELECT COUNT(*) as total FROM testimonials t ${whereClause}`,
      params
    )) as any[]

    const total = countResult.total || 0
    const totalPages = Math.ceil(total / limit)

    debugLog(`Total testimonials: ${total}, Total pages: ${totalPages}`);

    // Get testimonials
    debugLog("Fetching testimonials...");
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
        qr.scheduled_date,
        qr.completed_date,
        c.business_name as cleaner_business_name
      FROM testimonials t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN quote_requests qr ON t.quote_id = qr.id
      LEFT JOIN cleaner_assignments ca ON qr.id = ca.quote_request_id AND ca.status = 'completed'
      LEFT JOIN cleaners c ON ca.cleaner_id = c.id
      ${whereClause}
      ORDER BY t.${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )) as any[]

    debugLog(`Fetched ${testimonials.length} testimonials`);

    // Get statistics
    debugLog("Fetching statistics...");
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

    const responseData = {
      success: true,
      data: {
        testimonials: testimonials || [],
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
          positivePercentage: stats?.total_reviews && stats.total_reviews > 0
            ? Math.round((stats.positive_reviews / stats.total_reviews) * 100)
            : 0
        }
      }
    }

    debugLog("Returning successful response");
    return NextResponse.json(responseData)

  } catch (error: any) {
    debugLog("ERROR in GET request:", error.message);
    debugLog("Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Similar fixes for other endpoints...