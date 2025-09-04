import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const siteConfig = (await query("SELECT * FROM site_config ORDER BY id DESC LIMIT 1")) as any[]
    return NextResponse.json({ siteConfig: siteConfig[0] || null })
  } catch (error) {
    console.error("Error fetching site config:", error)
    return NextResponse.json({ error: "Failed to fetch site config" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { heroTitle, heroSubtitle } = await request.json()

    if (!heroTitle || !heroSubtitle) {
      return NextResponse.json({ error: "Hero title and subtitle are required" }, { status: 400 })
    }

    // Check if config exists
    const existing = (await query("SELECT id FROM site_config LIMIT 1")) as any[]

    if (existing.length > 0) {
      // Update existing
      await query("UPDATE site_config SET hero_title = ?, hero_subtitle = ?, updated_at = CURRENT_TIMESTAMP", [
        heroTitle,
        heroSubtitle,
      ])
    } else {
      // Create new
      await query("INSERT INTO site_config (hero_title, hero_subtitle) VALUES (?, ?)", [heroTitle, heroSubtitle])
    }

    return NextResponse.json({ success: true, message: "Site configuration updated successfully" })
  } catch (error) {
    console.error("Error updating site config:", error)
    return NextResponse.json({ error: "Failed to update site config" }, { status: 500 })
  }
}
