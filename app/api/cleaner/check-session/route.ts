import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyCleanerSession } from "@/lib/session-utils"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const cleanerSession = cookieStore.get("cleaner_session")?.value

    if (!cleanerSession) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const cleanerData = await verifyCleanerSession(cleanerSession)
    if (!cleanerData) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: cleanerData.id,
        email: cleanerData.email,
        name: cleanerData.name,
        business_name: cleanerData.business_name,
        cleaner_id: cleanerData.cleaner_id
      }
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}