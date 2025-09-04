import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, scheduledDate } = await request.json()
    const bookingId = params.id

    const updateFields: string[] = []
    const updateValues: any[] = []

    if (status) {
      updateFields.push("status = ?")
      updateValues.push(status)

      if (status === "completed") {
        updateFields.push("completed_at = CURRENT_TIMESTAMP")
      }
    }

    if (scheduledDate) {
      updateFields.push("scheduled_date = ?")
      updateValues.push(scheduledDate)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(bookingId)

    const updateQuery = `UPDATE bookings SET ${updateFields.join(", ")} WHERE id = ?`
    await query(updateQuery, updateValues)

    return NextResponse.json({ success: true, message: "Booking updated successfully" })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
