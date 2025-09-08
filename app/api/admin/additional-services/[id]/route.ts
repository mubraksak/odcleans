import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const services = await query(`
      SELECT asp.*, s.name as service_title 
      FROM additional_service_pricing asp
      LEFT JOIN services s ON asp.service_id = s.id
      WHERE asp.id = ?
    `, [id]) as any[]; // Explicitly cast to array
    
    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { success: false, error: "Additional service not found" }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      additionalService: services[0] 
    })
  } catch (error) {
    console.error("Error fetching additional service:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch additional service" }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, service_id, description, base_price, unit, is_optional } = await request.json()

    await query(
      `UPDATE additional_service_pricing 
       SET name = ?, service_id = ?, description = ?, base_price = ?, unit = ?, is_optional = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, service_id, description, base_price, unit, is_optional, id]
    )

    return NextResponse.json({ 
      success: true,
      message: "Additional service updated successfully" 
    })
  } catch (error) {
    console.error("Error updating additional service:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update additional service" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingService = await query(
      "SELECT id FROM additional_service_pricing WHERE id = ?",
      [id]
    ) as any[];
    
    if (existingService.length === 0) {
      return NextResponse.json(
        { success: false, error: "Additional service not found" }, 
        { status: 404 }
      )
    }
    
    await query("DELETE FROM additional_service_pricing WHERE id = ?", [id])
    
    return NextResponse.json({ 
      success: true,
      message: "Additional service deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting additional service:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete additional service" }, 
      { status: 500 }
    )
  }
}