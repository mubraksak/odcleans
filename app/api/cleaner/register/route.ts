import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { hash } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      name, 
      business_name, 
      phone, 
      address, 
      service_areas, 
      services_offered, 
      experience_years, 
      hourly_rate 
    } = await request.json()

    // Check if user already exists
    const existingUser = (await query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    )) as any[]

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      )
    }

    // Create user
    const hashedPassword = await hash(password, 12)
    const userResult = (await query(
      "INSERT INTO users (email, password, name, role, phone) VALUES (?, ?, ?, 'cleaner', ?)",
      [email, hashedPassword, name, phone]
    )) as any

    const userId = userResult.insertId

    // Create cleaner profile
    await query(
      `INSERT INTO cleaners (
        user_id, business_name, phone, address, service_areas, 
        services_offered, experience_years, hourly_rate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        business_name,
        phone,
        address,
        JSON.stringify(service_areas),
        JSON.stringify(services_offered),
        experience_years,
        hourly_rate
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: "Cleaner registration submitted for approval" 
    })
  } catch (error) {
    console.error("Error registering cleaner:", error)
    return NextResponse.json(
      { error: "Failed to register cleaner" },
      { status: 500 }
    )
  }
}