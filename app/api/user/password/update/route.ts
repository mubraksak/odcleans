// app/api/user/password/update/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { query } from "@/lib/database"
import bcrypt from "bcryptjs"

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
      `SELECT id, password FROM users 
       WHERE session_token = ? AND session_expires > NOW()`,
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
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      )
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(body.currentPassword, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(body.newPassword, 10)

    // Update password
    await query(
      `UPDATE users SET 
        password = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [hashedPassword, user.id]
    )

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    })

  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}