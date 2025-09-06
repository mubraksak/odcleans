import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Note: params is now a Promise
) {
  try {
    const { status, scheduledDate } = await request.json()
    const { id } = await params // Await the params first
    const bookingId = id

    const updateFields: string[] = []
    const updateValues: any[] = []

    if (status) {
      updateFields.push('status = ?')
      updateValues.push(status)
    }

    if (scheduledDate) {
      updateFields.push('scheduled_date = ?')
      updateValues.push(scheduledDate)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: 'No fields to update' },
        { status: 400 }
      )
    }

    updateValues.push(bookingId)

    // Update the booking
    await query(
      `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Booking updated successfully' 
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { message: 'Error updating booking' },
      { status: 500 }
    )
  }
}