// app/api/review/generate-token/route.ts
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, quoteId, email } = body

    if (!userId || !quoteId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user and quote exist
    const [quoteData] = (await query(
      `SELECT id, status FROM quote_requests 
       WHERE id = ? AND user_id = ?`,
      [quoteId, userId]
    )) as any[]

    if (!quoteData) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      )
    }

    // Check if quote is completed
    if (quoteData.status !== 'completed') {
      return NextResponse.json(
        { error: "Cannot request review for incomplete quotes" },
        { status: 400 }
      )
    }

    // Check for existing active token
    const [existingToken] = (await query(
      `SELECT token FROM review_tokens 
       WHERE user_id = ? AND quote_id = ? AND used = false AND expires_at > NOW()`,
      [userId, quoteId]
    )) as any[]

    if (existingToken) {
      return NextResponse.json({
        success: true,
        token: existingToken.token,
        message: "Active review link already exists"
      })
    }

    // Generate new token
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    await query(
      `INSERT INTO review_tokens (token, user_id, quote_id, email, expires_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [token, userId, quoteId, email, expiresAt]
    )

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
      message: "Review token generated successfully"
    })

  } catch (error) {
    console.error("Generate token error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}