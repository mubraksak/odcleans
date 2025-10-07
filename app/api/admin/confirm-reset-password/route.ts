import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    // Verify token is valid and not expired
    const admins = (await query(
      "SELECT id FROM admin_users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    )) as any[]

    if (admins.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    const admin = admins[0]

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await query(
      "UPDATE admin_users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, admin.id]
    )

    return NextResponse.json({
      message: "Password reset successfully"
    })

  } catch (error) {
    console.error("Confirm reset password error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}