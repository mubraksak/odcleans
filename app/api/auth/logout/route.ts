// app/api/admin/logout/route.ts
import { NextResponse } from "next/server"
import { query } from "@/lib/database"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (sessionToken) {
      // Clear the session from the database
      await query(
        "UPDATE users SET session_token = NULL, session_expires = NULL WHERE session_token = ?",
        [sessionToken]
      )
    }

    // Clear the cookie
    cookieStore.delete("session")

    return NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}