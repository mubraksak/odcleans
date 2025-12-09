import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { emailService } from '@/lib/email-service'

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

   // Send email to customer about update here
if (status) {
  const bookingDetails = (await query(
    `SELECT b.id, b.quote_request_id, b.scheduled_date, b.status, u.name, u.email, u.id as user_id
     FROM bookings b
     JOIN quote_requests qr ON b.quote_request_id = qr.id
     JOIN users u ON qr.user_id = u.id
     WHERE b.id = ?`,
    [bookingId]
  )) as any[]
  
  if (bookingDetails.length > 0) {
    // Get booking details 
    const booking = bookingDetails[0];
    
    let reviewToken = null;
    
    // If status is "completed", generate a review token
    if (status.toLowerCase() === 'completed') {
      try {
        // Helper function to ensure we have the user_id
        async function getUserIdFromQuote(quoteId: number): Promise<number | null> {
          const [result] = (await query(
            `SELECT user_id FROM quote_requests WHERE id = ?`,
            [quoteId]
          )) as any[];
          return result?.user_id || null;
        }
        
        // Ensure we have the user_id
        let userId = booking.user_id;
        if (!userId) {
          userId = await getUserIdFromQuote(booking.quote_request_id);
        }
        
        if (!userId) {
          console.error('Could not find user ID for quote:', booking.quote_request_id);
        } else {
          const tokenResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/review/generate-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              quoteId: booking.quote_request_id,
              email: booking.email
            })
          });
          
          const tokenData = await tokenResponse.json();
          if (tokenData.success) {
            reviewToken = tokenData.token;
          }
        }
      } catch (error) {
        console.error('Failed to generate review token:', error);
      }
    }
    
    // Call email sending function with status-specific content
    await emailService.sendBookingUpdateEmail(
      booking.email, 
      booking.name, 
      booking.quote_request_id, 
      booking.scheduled_date, 
      status, // Send the actual status
      reviewToken // Include review token if status is completed
    );
    
    // If status is completed and we have a token, also send the review request
    if (status.toLowerCase() === 'completed' && reviewToken) {
      // You can optionally send a separate review request email
      // await emailService.sendReviewRequest(
      //   booking.email,
      //   booking.name,
      //   booking.quote_request_id,
      //   reviewToken
      // );
    }
  }
}

// Helper function to get user ID from quote (if not already in bookingDetails)
async function getUserIdFromQuote(quoteId: number) {
  const [result] = (await query(
    `SELECT user_id FROM quote_requests WHERE id = ?`,
    [quoteId]
  )) as any[];
  return result?.user_id;
}
   

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