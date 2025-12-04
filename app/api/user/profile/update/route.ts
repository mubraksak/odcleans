// app/api/user/profile/update/route.ts
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

    // Verify session
    const users = (await query(
      `SELECT id FROM users 
       WHERE session_token = ? AND session_expires > NOW() AND role = 'customer'`,
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

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    if (body.email) {
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
    }

    // Update user profile
    await query(
      `UPDATE users SET 
        name = ?,
        email = ?,
        phone = ?,
        address = ?,
        city = ?,
        state = ?,
        zip_code = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        body.name,
        body.email,
        body.phone || null,
        body.address || null,
        body.city || null,
        body.state || null,
        body.zip_code || null,
        user.id
      ]
    )

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    })

  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}