import { NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { SiteConfig, Service, Testimonial } from "@/lib/types"

export async function GET() {
  try {
    // Fetch site configuration
    const siteConfigResult = (await query("SELECT * FROM site_config ORDER BY id DESC LIMIT 1")) as SiteConfig[]
    const siteConfig = siteConfigResult[0] || {
      hero_title: "Premium Cleaning Services for Your Home & Office",
      hero_subtitle:
        "Experience the difference with Od Cleaning Services. Professional, reliable, and thorough cleaning solutions tailored to your needs.",
    }

    // Fetch active services
    const services = (await query(
      "SELECT * FROM services WHERE is_active = TRUE ORDER BY display_order ASC",
    )) as Service[]

    // Fetch active testimonials
    const testimonials = (await query(
      "SELECT * FROM testimonials WHERE is_active = TRUE ORDER BY display_order ASC",
    )) as Testimonial[]

    return NextResponse.json({
      siteConfig,
      services,
      testimonials,
    })
  } catch (error) {
    console.error("Error fetching site config:", error)
    return NextResponse.json({ error: "Failed to fetch site configuration" }, { status: 500 })
  }
}
