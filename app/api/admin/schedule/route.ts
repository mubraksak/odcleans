import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    let whereClause = ""
    const params: any[] = []

    if (start && end) {
      whereClause = "WHERE b.scheduled_date BETWEEN ? AND ?"
      params.push(start, end)
    }

    // Get bookings with quote and user details
    const bookings = (await query(
      `SELECT b.*, qr.cleaning_type, qr.property_type, qr.bedrooms, qr.total_price,
              u.name as user_name, u.email as user_email, u.phone as user_phone, qr.street_address as user_address, qr.city as user_city, qr.state as user_state ,qr.zip_code as user_zip
       FROM bookings b
       JOIN quote_requests qr ON b.quote_request_id = qr.id
       JOIN users u ON qr.user_id = u.id
       ${whereClause}
       ORDER BY b.scheduled_date ASC`,
      params,
    )) as any[]

    // Format for calendar
    const events = bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.cleaning_type.replace("_", " ")} - ${booking.user_name}`,
      start: booking.scheduled_date,
      end: new Date(new Date(booking.scheduled_date).getTime() + 2 * 60 * 60 * 1000), // 2 hours duration
      backgroundColor: getStatusColor(booking.status),
      borderColor: getStatusColor(booking.status),
      extendedProps: {
        booking,
        user: {
          name: booking.user_name,
          email: booking.user_email,
          phone: booking.user_phone,
          address: booking.user_address,
          ad_state: booking.user_state, 
          zip: booking.user_zip, 
          d_state: booking.user_state, 
          city: booking.user_city
        },
        quote: {
          cleaningType: booking.cleaning_type,
          propertyType: booking.property_type,
          rooms: booking.bedrooms,
          total_price: booking.total_price,
        },
      },
    }))

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "confirmed":
      return "#2563eb" // blue
    case "in_progress":
      return "#f59e0b" // amber
    case "completed":
      return "#10b981" // emerald
    case "cancelled":
      return "#ef4444" // red
    default:
      return "#6b7280" // gray
  }
}
