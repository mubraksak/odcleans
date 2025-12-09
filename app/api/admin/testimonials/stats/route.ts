// app/api/admin/testimonials/stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/database"

// GET detailed statistics
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

    // Get comprehensive statistics
    const [overallStats] = (await query(
      `SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_reviews,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_reviews,
        AVG(rating) as average_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM testimonials`
    )) as any[]

    // Get monthly statistics for the last 12 months
    const monthlyStats = (await query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as review_count,
        AVG(rating) as avg_rating
      FROM testimonials
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC`
    )) as any[]

    // Get service type distribution
    const serviceStats = (await query(
      `SELECT 
        COALESCE(service_type, 'General') as service_type,
        COUNT(*) as review_count,
        AVG(rating) as avg_rating
      FROM testimonials
      GROUP BY COALESCE(service_type, 'General')
      ORDER BY review_count DESC`
    )) as any[]

    // Get recent reviews (last 7 days)
    const [recentStats] = (await query(
      `SELECT 
        COUNT(*) as recent_reviews,
        AVG(rating) as recent_avg_rating
      FROM testimonials
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    )) as any[]

    // Get top cleaners by average rating
    const topCleaners = (await query(
      `SELECT 
        c.business_name,
        c.contact_name,
        COUNT(t.id) as review_count,
        AVG(t.rating) as avg_rating
      FROM testimonials t
      JOIN quote_requests qr ON t.quote_id = qr.id
      JOIN cleaner_assignments ca ON qr.id = ca.quote_request_id AND ca.status = 'completed'
      JOIN cleaners c ON ca.cleaner_id = c.id
      WHERE c.business_name IS NOT NULL
      GROUP BY c.id, c.business_name, c.contact_name
      HAVING COUNT(t.id) >= 3
      ORDER BY avg_rating DESC
      LIMIT 10`
    )) as any[]

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          totalReviews: overallStats?.total_reviews || 0,
          activeReviews: overallStats?.active_reviews || 0,
          inactiveReviews: overallStats?.inactive_reviews || 0,
          averageRating: overallStats?.average_rating ? parseFloat(overallStats.average_rating).toFixed(1) : "0.0",
          minRating: overallStats?.min_rating || 0,
          maxRating: overallStats?.max_rating || 0,
          ratingDistribution: {
            fiveStar: overallStats?.five_star || 0,
            fourStar: overallStats?.four_star || 0,
            threeStar: overallStats?.three_star || 0,
            twoStar: overallStats?.two_star || 0,
            oneStar: overallStats?.one_star || 0
          }
        },
        monthly: monthlyStats,
        serviceTypes: serviceStats,
        recent: {
          reviewCount: recentStats?.recent_reviews || 0,
          averageRating: recentStats?.recent_avg_rating ? parseFloat(recentStats.recent_avg_rating).toFixed(1) : "0.0"
        },
        topCleaners: topCleaners
      }
    })

  } catch (error) {
    console.error("Get testimonial stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}