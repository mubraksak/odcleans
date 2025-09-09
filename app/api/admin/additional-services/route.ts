import { NextResponse } from "next/server"
import { query } from "@/lib/database"

// export async function GET() {
//   try {
//     const services = (await query(
//       "SELECT service_type, base_price, description FROM additional_service_pricing WHERE is_active = TRUE ORDER BY service_type"
//     )) as any[]
    
//     return NextResponse.json({ services })
//   } catch (error) {
//     console.error("Error fetching services:", error)
//     return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
//   }
// }


export async function GET() {
  try {

     const services = (await query(
      "SELECT name, base_price, description FROM additional_service_pricing WHERE is_active = TRUE ORDER BY name ASC "
    )) as any[]


    const additionalServices = await query(`
      SELECT asp.*, s.name as service_name 
      FROM additional_service_pricing asp
      LEFT JOIN services s ON asp.service_id = s.id
      ORDER BY s.name, asp.description
    `)

    return NextResponse.json({ 
      success: true,
      services,
      additionalServices 
    })
  } catch (error) {
    console.error("Error fetching additional services:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch additional services" }, 
      { status: 500 }
    )
  }
}


export async function POST(request: Request) {
  try {
    const { service_id, description, base_price, unit, is_optional } = await request.json()

    const result = await query(
      `INSERT INTO additional_service_pricing (service_id, description, base_price, unit, is_optional)
       VALUES (?, ?, ?, ?, ?)`,
      [service_id, description, base_price, unit, is_optional]
    )

    return NextResponse.json({ 
      success: true, 
      result,
      message: "Additional service created successfully" 
    })
  } catch (error) {
    console.error("Error creating additional service:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create additional service" }, 
      { status: 500 }
    )
  }
}