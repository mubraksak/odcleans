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


export async function verifyCleanerSession(sessionToken: string) {
  try {
    if (!sessionToken) {
      return null
    }

    console.log("🔐 Verifying session token:", sessionToken.substring(0, 10) + "...")

    const users = (await query(
      `SELECT u.*, c.*, c.id as cleaner_id 
       FROM users u 
       JOIN cleaners c ON u.id = c.user_id 
       WHERE u.session_token = ? 
       AND u.role = 'cleaner' 
       AND (u.session_expires > NOW() OR u.session_expires IS NULL)
       AND c.status = 'approved'`,
      [sessionToken]
    )) as any[]
    
    console.log("📊 Session verification result:", users.length > 0 ? "VALID" : "INVALID")
    
    return users[0] || null
  } catch (error) {
    console.error("❌ Session verification error:", error)
    return null
  }
}