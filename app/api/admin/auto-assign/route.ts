import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { quote_request_id } = await request.json()

    // Get quote details
    const quoteDetails = (await query(
      `SELECT qr.*, b.scheduled_date 
       FROM quote_requests qr 
       LEFT JOIN bookings b ON qr.id = b.quote_request_id 
       WHERE qr.id = ?`,
      [quote_request_id]
    )) as any[]

    if (quoteDetails.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    const quote = quoteDetails[0]

    // Find available cleaners based on:
    // 1. Status (approved)
    // 2. Availability (matching schedule)
    // 3. Service areas
    // 4. Rating and performance
    const availableCleaners = (await query(
      `SELECT 
         c.*, u.name, u.email,
         COUNT(ca.id) as total_assignments,
         AVG(cr.rating) as avg_rating,
         (SELECT COUNT(*) FROM cleaner_assignments ca2 
          WHERE ca2.cleaner_id = c.id AND ca2.status IN ('accepted', 'completed')
          AND DATE(ca2.assigned_date) = CURDATE()) as today_assignments
       FROM cleaners c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN cleaner_assignments ca ON c.id = ca.cleaner_id
       LEFT JOIN cleaner_reviews cr ON c.id = cr.cleaner_id
       WHERE c.status = 'approved' 
         AND c.is_available = TRUE
         AND (c.service_areas LIKE ? OR c.service_areas IS NULL)
       GROUP BY c.id, u.id
       HAVING today_assignments < 3 -- Max 3 assignments per day
       ORDER BY avg_rating DESC, today_assignments ASC
       LIMIT 5`,
      [`%${quote.property_type}%`]
    )) as any[]

    if (availableCleaners.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No available cleaners found for this job" 
      })
    }

    // Select the best cleaner (highest rating, least busy)
    const bestCleaner = availableCleaners[0]

    // Calculate payment amount (70% of quote total)
    const paymentAmount = quote.total_price * 0.7

    // Create assignment
    await query(
      `INSERT INTO cleaner_assignments 
       (quote_request_id, cleaner_id, assigned_by, payment_amount, status) 
       VALUES (?, ?, 1, ?, 'pending')`,
      [quote_request_id, bestCleaner.id, paymentAmount]
    )

    return NextResponse.json({ 
      success: true, 
      cleaner: {
        id: bestCleaner.id,
        name: bestCleaner.name,
        business_name: bestCleaner.business_name,
        email: bestCleaner.email
      },
      message: `Automatically assigned to ${bestCleaner.business_name}`
    })
  } catch (error) {
    console.error("Error in auto-assignment:", error)
    return NextResponse.json({ error: "Failed to auto-assign cleaner" }, { status: 500 })
  }
}