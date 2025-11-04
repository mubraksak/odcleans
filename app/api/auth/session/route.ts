import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "No session token" }, { status: 401 })
    }

    // Verify session token against database
    const users = (await query(
      "SELECT id, email, name FROM users WHERE session_token = ? AND session_expires > NOW()",
      [sessionToken],
    )) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }

    const user = users[0]

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error("Session verification failed:", error)
    return NextResponse.json({ error: "Session verification failed" }, { status: 500 })
  }
}