import { NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { Service } from "@/lib/types"

export async function GET() {
  try {
    const services = (await query(
      "SELECT * FROM services ORDER BY display_order ASC, name ASC"
    )) as Service[]

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { 
      name, 
      description, 
      image_url, 
      
      displayOrder, 
      isActive 
    } = await request.json()
    console.log(name, description, image_url, displayOrder, isActive)
    const result = await query(
      `INSERT INTO services (name, description, image_url, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, image_url || null, displayOrder || 0, isActive || 1]
    ) as { insertId?: number }

    return NextResponse.json({ 
      success: true, 
      id: result.insertId,
      message: "Service created successfully" 
    })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Failed to create service" }, 
      { status: 500 }
    )
  }
}