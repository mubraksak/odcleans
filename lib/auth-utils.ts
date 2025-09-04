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


