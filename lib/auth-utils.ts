import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { query } from "./database"
import crypto from "crypto"


export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > new Date(expiryDate)
}

export async function getCurrentUser(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return null
    }

    const users = (await query(
      "SELECT id, email, name, phone FROM users WHERE session_token = ? AND session_expires > NOW()",
      [sessionToken],
    )) as any[]

    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}



export async function verifyCleanerSession(sessionToken: string) {
  try {
    if (!sessionToken) {
      return null
    }

    const users = (await query(
      `SELECT u.*, c.*, c.id as cleaner_id 
       FROM users u 
       JOIN cleaners c ON u.id = c.user_id 
       WHERE u.session_token = ? 
       AND u.role = 'cleaner' 
       AND u.session_expires > NOW() 
       AND c.status = 'approved'`,
      [sessionToken]
    )) as any[]
    
    return users[0] || null
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}


