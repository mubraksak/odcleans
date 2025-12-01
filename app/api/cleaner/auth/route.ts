// app/api/cleaner/auth/route.ts
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { compare } from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("🔐 Cleaner login attempt for:", email)

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find cleaner user with proper error handling
    const users = (await query(
      `SELECT u.*, c.id as cleaner_id, c.status as cleaner_status, c.business_name
       FROM users u 
       JOIN cleaners c ON u.id = c.user_id 
       WHERE u.email = ? AND u.role = 'cleaner'`,
      [email.trim().toLowerCase()]
    )) as any[]

    if (users.length === 0) {
      console.log("❌ No cleaner found with email:", email)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const user = users[0]
    console.log("👤 Cleaner found:", user.cleaner_status)

    // Check if cleaner is approved
    if (user.cleaner_status !== 'approved') {
      console.log("⏳ Cleaner not approved, status:", user.cleaner_status)
      return NextResponse.json(
        { 
          error: `Your account is ${user.cleaner_status}. Please wait for admin approval.` 
        },
        { status: 401 }
      )
    }

    // Verify password
    console.log("🔑 Verifying password...")
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      console.log("❌ Invalid password for:", email)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Create session token
    const sessionToken = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    
    console.log("💾 Creating session for cleaner:", user.cleaner_id)

    // Update user session in database
    await query(
      "UPDATE users SET session_token = ?, session_expires = ? WHERE id = ?",
      [sessionToken, expiresAt, user.id]
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

    // Set session cookie - FIXED: Use proper cookie settings
    response.cookies.set("cleaner_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    console.log("✅ Login successful for:", email)
    return response

  } catch (error) {
    console.error("❌ Cleaner login error:", error)
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    )
  }
}