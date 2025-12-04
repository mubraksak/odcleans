// app/api/cleaner/profile/update/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/database"

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify session and get user
    const users = (await query(
      `SELECT id FROM users 
       WHERE session_token = ? AND session_expires > NOW() AND role = 'cleaner'`,
      [sessionToken]
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const user = users[0]
    const body = await request.json()

    // Get cleaner ID from user_id
    const [cleaner] = (await query(
      `SELECT id FROM cleaners WHERE user_id = ?`,
      [user.id]
    )) as any[]

    if (!cleaner) {
      return NextResponse.json(
        { error: "Cleaner profile not found" },
        { status: 404 }
      )
    }

    // Update user table (name, email, phone)
    if (body.name || body.email || body.phone) {
      const updateFields = []
      const updateValues = []

      if (body.name) {
        updateFields.push("name = ?")
        updateValues.push(body.name)
      }
      
      if (body.email) {
        // Check if email is already taken by another user
        const existingUser = (await query(
          `SELECT id FROM users WHERE email = ? AND id != ?`,
          [body.email, user.id]
        )) as any[]

        if (existingUser.length > 0) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 409 }
          )
        }
        
        updateFields.push("email = ?")
        updateValues.push(body.email)
      }
      
      if (body.phone) {
        updateFields.push("phone = ?")
        updateValues.push(body.phone)
      }

      if (updateFields.length > 0) {
        updateValues.push(user.id)
        await query(
          `UPDATE users SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
          updateValues
        )
      }
    }

    // Update cleaner table
    const cleanerFields = []
    const cleanerValues = []

    if (body.business_name) {
      cleanerFields.push("business_name = ?")
      cleanerValues.push(body.business_name)
    }
    
    if (body.phone !== undefined) {
      cleanerFields.push("phone = ?")
      cleanerValues.push(body.phone)
    }
    
    if (body.address) {
      cleanerFields.push("address = ?")
      cleanerValues.push(body.address)
    }
    
    if (body.service_areas) {
      cleanerFields.push("service_areas = ?")
      cleanerValues.push(body.service_areas)
    }
    
    if (body.services_offered) {
      cleanerFields.push("services_offered = ?")
      cleanerValues.push(body.services_offered)
    }
    
    if (body.experience_year !== undefined) {
      cleanerFields.push("experience_year = ?")
      cleanerValues.push(body.experience_year)
    }
    
    if (body.hourly_rate !== undefined) {
      cleanerFields.push("hourly_rate = ?")
      cleanerValues.push(body.hourly_rate)
    }
    
    if (body.is_available !== undefined) {
      cleanerFields.push("is_available = ?")
      cleanerValues.push(body.is_available)
    }

    if (cleanerFields.length > 0) {
      cleanerValues.push(cleaner.id)
      await query(
        `UPDATE cleaners SET ${cleanerFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        cleanerValues
      )
    }

    return NextResponse.json({
      success: true,
      message: "Cleaner profile updated successfully"
    })

  } catch (error) {
    console.error("Update cleaner profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}