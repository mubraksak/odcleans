import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transactionId = parseInt(id)

    // Fetch transaction with quote details
    const transactions = (await query(
      `SELECT 
        t.*,
        qr.property_type,
        qr.cleaning_type,
        qr.bedrooms,
        qr.bathrooms,
        qr.square_footage,
        qr.special_instructions,
        qr.additional_details
      FROM transactions t
      LEFT JOIN quote_requests qr ON t.quote_id = qr.id
      WHERE t.id = ?`,
      [transactionId]
    )) as any[]

    if (transactions.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const transaction = transactions[0]

    // For now, return JSON. You can integrate with a PDF generation library like pdfkit or puppeteer
    return NextResponse.json({
      invoice: {
        id: transaction.id,
        quote_id: transaction.quote_id,
        transaction_id: transaction.stripe_payment_intent_id,
        date: transaction.created_at,
        customer: {
          name: transaction.customer_name,
          email: transaction.customer_email
        },
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        service_details: {
          property_type: transaction.property_type,
          cleaning_type: transaction.cleaning_type,
          bedrooms: transaction.bedrooms,
          bathrooms: transaction.bathrooms,
          square_footage: transaction.square_footage,
          special_instructions: transaction.special_instructions
        }
      }
    })

    // Note: To generate actual PDF invoices, you would use:
    // - pdfkit (for Node.js PDF generation)
    // - puppeteer (to generate PDF from HTML)
    // - react-pdf (for React PDF generation)
    // Return the PDF blob instead of JSON

  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}