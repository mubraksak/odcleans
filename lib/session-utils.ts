// lib/session-utils.ts
"use server"

import { cookies } from "next/headers"
import { query } from "@/lib/database"

export async function getAdminSession() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return null
    }

    // Check if session exists and is valid
    const admins = (await query(
      "SELECT id, email, name, role FROM admin_users WHERE session_token = ? AND is_active = TRUE AND session_expires > NOW()",
      [sessionToken]
    )) as any[]

    return admins.length > 0 ? admins[0] : null
  } catch (error) {
    console.error("Session check error:", error)
    return null
  }
}