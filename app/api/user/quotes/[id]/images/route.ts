import { NextResponse, NextRequest } from "next/server"
import { query } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const quoteId = parseInt(id)

    // Verify the quote belongs to the user
    const userQuotes = (await query(
      "SELECT id FROM quote_requests WHERE id = ? AND user_id = ?",
      [quoteId, user.id]
    )) as any[]

    if (userQuotes.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }
    
    const images = (await query(
      `SELECT id, image_url, image_name, image_size, uploaded_at 
       FROM quote_images 
       WHERE quote_id = ? 
       ORDER BY uploaded_at ASC`,
      [quoteId]
    )) as any[]
    
    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error fetching quote images:", error)
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    )
  }
}