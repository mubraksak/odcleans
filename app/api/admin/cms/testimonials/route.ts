import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const testimonials = (await query("SELECT * FROM testimonials ORDER BY display_order ASC")) as any[]
    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { clientName, quote, imageUrl, displayOrder } = await request.json()

    if (!clientName || !quote) {
      return NextResponse.json({ error: "Client name and quote are required" }, { status: 400 })
    }

    const result = (await query(
      "INSERT INTO testimonials (client_name, quote, image_url, display_order) VALUES (?, ?, ?, ?)",
      [clientName, quote, imageUrl || null, displayOrder || 0],
    )) as any

    return NextResponse.json({ success: true, testimonialId: result.insertId })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}
