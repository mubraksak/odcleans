import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const services = (await query(
      "SELECT service_type, base_price, description FROM additional_service_pricing WHERE is_active = TRUE ORDER BY service_type"
    )) as any[]
    
    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}