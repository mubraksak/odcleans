import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const tokens = (await query(
      "SELECT id FROM admin_users  WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    )) as any[]

    return NextResponse.json({
      valid: tokens.length > 0
    })

  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}