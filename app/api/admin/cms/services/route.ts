import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const services = (await query("SELECT * FROM services ORDER BY display_order ASC")) as any[]
    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, displayOrder } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    const result = (await query("INSERT INTO services (name, description, display_order) VALUES (?, ?, ?)", [
      name,
      description,
      displayOrder || 0,
    ])) as any

    return NextResponse.json({ success: true, serviceId: result.insertId })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
