import { NextResponse } from "next/server"
import { query } from "@/lib/database"
// import type { Service } from "@/lib/types"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { isActive } = await request.json()
    
    // Check if service exists
    const existingServiceResult = await query(
      "SELECT id FROM services WHERE id = ?",
      [id]
    )
    
    // If your query returns an object with a 'rows' property (common in some DB libs)
    const existingService = Array.isArray(existingServiceResult)
      ? existingServiceResult
      : [];

    if (existingService.length === 0) {
      return NextResponse.json(
        { error: "Service not found" }, 
        { status: 404 }
      )
    }
    
    await query(
      "UPDATE services SET is_active = ?, updated_at = NOW() WHERE id = ?",
      [isActive, id]
    )
    
    return NextResponse.json({ 
      success: true,
      message: "Service status updated successfully" 
    })
  } catch (error) {
    console.error("Error updating service status:", error)
    return NextResponse.json(
      { error: "Failed to update service status" }, 
      { status: 500 }
    )
  }
}