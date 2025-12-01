import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { cookies } from "next/headers"
import { verifyCleanerSession } from "@/lib/session-utils"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("cleaner_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cleanerData = await verifyCleanerSession(sessionCookie.value)
    if (!cleanerData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const availability = (await query(
      "SELECT * FROM cleaner_availability WHERE cleaner_id = ? ORDER BY day_of_week, start_time",
      [cleanerData.id]
    )) as any[]

    return NextResponse.json({ availability })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("cleaner_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cleanerData = await getCleanerFromSession(sessionCookie.value)
    if (!cleanerData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { availability } = await request.json()

    // Delete existing availability
    await query(
      "DELETE FROM cleaner_availability WHERE cleaner_id = ?",
      [cleanerData.id]
    )

    // Insert new availability
    for (const slot of availability) {
      if (slot.is_available) {
        await query(
          "INSERT INTO cleaner_availability (cleaner_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)",
          [cleanerData.id, slot.day_of_week, slot.start_time, slot.end_time, true]
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}

// Helper function
async function getCleanerFromSession(sessionToken: string) {
  try {
    const user = (await query(
      `SELECT u.*, c.*, c.id as cleaner_id 
       FROM users u 
       JOIN cleaners c ON u.id = c.user_id 
       WHERE u.session_token = ? AND u.role = 'cleaner'`,
      [sessionToken]
    )) as any[]
    
    return user[0] || null
  } catch (error) {
    return null
  }
}