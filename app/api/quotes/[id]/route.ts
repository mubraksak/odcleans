import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params object
    const { id } = await params
    const quoteId = parseInt(id)

    if (isNaN(quoteId)) {
      return NextResponse.json(
        { error: "Invalid quote ID" },
        { status: 400 }
      )
    }

    // Fetch quote details
    const quotes = (await query(
      `SELECT 
        qr.id,
        qr.service_type,
        qr.property_type,
        qr.bedrooms,
        qr.bathrooms,
        qr.square_footage,
        qr.cleaning_type,
        qr.cleaning_frequency,
        qr.total_price,
        qr.status,
        qr.contact_name,
        qr.contact_email,
        qr.contact_phone,
        qr.street_address,
        qr.city,
        qr.state,
        qr.zip_code,
        qr.special_instructions,
        qr.additional_details,
        qr.created_at,
        GROUP_CONCAT(DISTINCT qas.service_type) as additional_services
       FROM quote_requests qr
       LEFT JOIN quote_additional_services qas ON qr.id = qas.quote_id
       WHERE qr.id = ?
       GROUP BY qr.id`,
      [quoteId]
    )) as any[]

    if (quotes.length === 0) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      )
    }

    const quote = quotes[0]

    // Format the response
    const response = {
      id: quote.id,
      serviceType: quote.service_type,
      propertyType: quote.property_type,
      bedrooms: quote.bedrooms,
      bathrooms: quote.bathrooms,
      squareFootage: quote.square_footage,
      cleaningType: quote.cleaning_type,
      cleaningFrequency: quote.cleaning_frequency,
      totalPrice: quote.total_price,
      status: quote.status,
      customerName: quote.contact_name,


      customerEmail: quote.contact_email,
      customerPhone: quote.contact_phone,
      addrss: {
        street: quote.street_address,
        city: quote.city,
        state: quote.state,
        zipCode: quote.zip_code
      },
      specialInstructions: quote.special_instructions,
      additionalDetails: quote.additional_details,
      additionalServices: quote.additional_services ? quote.additional_services.split(',') : [],
      createdAt: quote.created_at
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    )
  }
}