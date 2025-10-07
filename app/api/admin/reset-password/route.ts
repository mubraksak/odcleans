import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import crypto from "crypto"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if admin exists
    const admins = (await query(
      "SELECT id, name FROM admin_users WHERE email = ?",
      [email]
    )) as any[]

    if (admins.length === 0) {
      // Don't reveal whether admin exists for security
      return NextResponse.json({
        message: "If an admin account with this email exists, a reset link has been sent."
      })
    }

    const admin = admins[0]

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    await query(
      "UPDATE admin_users  SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [resetToken, resetTokenExpiry, admin.id]
    )

    // Send reset email
    const resetLink = `${process.env.NEXTAUTH_URL}/admin/reset-password/confirm?token=${resetToken}`
    
    try {
      await emailService.sendPasswordReset(email, admin.name, resetLink)
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError)
      // Continue anyway for security
    }

    return NextResponse.json({
      message: "If an admin account with this email exists, a reset link has been sent."
    })

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}