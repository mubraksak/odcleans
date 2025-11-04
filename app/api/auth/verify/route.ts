import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { cookies } from "next/headers"
import { generateToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {

  
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify token
    const users = (await query(
      "SELECT id, email, name FROM users WHERE magic_token = ? AND magic_token_expires > NOW()",
      [token],
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const user = users[0]

    // Clear the magic token
    await query("UPDATE users SET magic_token = NULL, magic_token_expires = NULL WHERE id = ?", [user.id])

    // Create session token
    const sessionToken = generateToken()
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store session
    await query("UPDATE users SET session_token = ?, session_expires = ? WHERE id = ?", [
      sessionToken,
      sessionExpires,
      user.id,
    ])

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: sessionExpires,
    })

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error verifying magic link:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}
