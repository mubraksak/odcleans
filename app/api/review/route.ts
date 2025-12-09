// app/api/review/route.ts
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    // Get review token data
    const [tokenData] = (await query(
      `SELECT 
        rt.*,
        u.name as userName,
        u.email,
        qr.id as quoteId,
        qr.service_type,
        b.scheduled_date,
        b.completed_at
      FROM review_tokens rt
      JOIN users u ON rt.user_id = u.id
      JOIN quote_requests qr ON rt.quote_id = qr.id
      JOIN bookings b ON qr.id = b.quote_request_id
      WHERE rt.token = ? AND rt.used = false AND rt.expires_at > NOW()`,
      [token]
    )) as any[]

    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired review link" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        token: tokenData.token,
        userName: tokenData.userName,
        email: tokenData.email,
        quoteId: tokenData.quoteId,
        serviceType: tokenData.service_type,
        serviceDate: tokenData.completed_date || tokenData.scheduled_date,
        expiresAt: tokenData.expires_at
      }
    })

  } catch (error) {
    console.error("Review API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}