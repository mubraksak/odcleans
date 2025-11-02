import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quoteId = parseInt(id)
    
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