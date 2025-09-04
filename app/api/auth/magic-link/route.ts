import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { generateToken } from "@/lib/auth-utils"
import { emailService } from "@/lib/email-service" // Import the email service

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const users = (await query("SELECT id, email, name FROM users WHERE email = ?", [email])) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "No account found with this email address" }, { status: 404 })
    }

    const user = users[0]

    // Generate magic link token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store token in database
    await query(
      "UPDATE users SET magic_token = ?, magic_token_expires = ? WHERE id = ?", 
      [token, expiresAt, user.id]
    )

    // Send magic link via email
    const emailSent = await emailService.sendMagicLink(
      user.email,
      user.name || user.email.split('@')[0], // Use name or email prefix
      token
    )

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send magic link email. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Magic link sent to your email. Check your inbox!",
      // For development only - include the magic link in response
      ...(process.env.NODE_ENV === 'development' && {
        debug_info: "Magic link sent via email. For testing:",
        magicLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${token}`
      })
    })

  } catch (error) {
    console.error("Error generating magic link:", error)
    return NextResponse.json(
      { error: "Failed to generate magic link" }, 
      { status: 500 }
    )
  }
}