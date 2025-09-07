import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const servicesResult = await query(
      "SELECT * FROM services WHERE id = ?",
      [id]
    )
    const services = Array.isArray(servicesResult) ? servicesResult : []
    
    if (services.length === 0) {
      return NextResponse.json(
        { error: "Service not found" }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json({ service: services[0] })
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json(
      { error: "Failed to fetch service" }, 
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
    const { 
      name, 
      description, 
      image_url, 
      displayOrder, 
      isActive 
    } = await request.json()
    
    await query(
      `UPDATE services 
       SET name = ?, description = ?, image_url = ?,  display_order = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, image_url ||  'https://images.unsplash.com/photo-1648475237029-7f853809ca14?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', displayOrder || 0, isActive, id]
    )
    
    return NextResponse.json({ 
      success: true,
      message: "Service updated successfully" 
    })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Failed to update service" }, 
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
    
    // Check if service exists
    const existingServiceResult = await query(
      "SELECT id FROM services WHERE id = ?",
      [id]
    )
    const existingService = Array.isArray(existingServiceResult) ? existingServiceResult : []
    
    if (existingService.length === 0) {
      return NextResponse.json(
        { error: "Service not found" }, 
        { status: 404 }
      )
    }
    
    await query("DELETE FROM services WHERE id = ?", [id])
    
    return NextResponse.json({ 
      success: true,
      message: "Service deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Failed to delete service" }, 
      { status: 500 }
    )
  }
}