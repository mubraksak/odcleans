import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear the session cookie
  response.cookies.set("cleaner_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0
  })

  return response
}