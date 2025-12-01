import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { compare } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find cleaner user
    const users = (await query(
      `SELECT u.*, c.id as cleaner_id, c.status as cleaner_status, c.business_name
       FROM users u 
       JOIN cleaners c ON u.id = c.user_id 
       WHERE u.email = ? AND u.role = 'cleaner'`,
      [email]
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check if cleaner is approved
    if (user.cleaner_status !== 'approved') {
      return NextResponse.json(
        { error: "Your account is pending approval" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create session (simplified - implement proper session management)
    const sessionToken = generateSessionToken()
    
    await query(
      "UPDATE users SET session_token = ? WHERE id = ?",
      [sessionToken, user.id]
    )

    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        business_name: user.business_name,
        cleaner_id: user.cleaner_id
      }
    })

    // Set session cookie
    response.cookies.set("cleaner_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (error) {
    console.error("Cleaner login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}

function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}