import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, description, displayOrder, isActive } = await request.json()
    const serviceId = params.id

    await query(
      "UPDATE services SET name = ?, description = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, description, displayOrder, isActive, serviceId],
    )

    return NextResponse.json({ success: true, message: "Service updated successfully" })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id
    await query("DELETE FROM services WHERE id = ?", [serviceId])
    return NextResponse.json({ success: true, message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
