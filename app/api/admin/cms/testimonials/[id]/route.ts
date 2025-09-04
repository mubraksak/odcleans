import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { clientName, quote, imageUrl, displayOrder, isActive } = await request.json()
    const testimonialId = params.id

    await query(
      "UPDATE testimonials SET client_name = ?, quote = ?, image_url = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [clientName, quote, imageUrl, displayOrder, isActive, testimonialId],
    )

    return NextResponse.json({ success: true, message: "Testimonial updated successfully" })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const testimonialId = params.id
    await query("DELETE FROM testimonials WHERE id = ?", [testimonialId])
    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}
