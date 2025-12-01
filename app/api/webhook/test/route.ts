import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("🔔 Test webhook received:", body)
    
    return NextResponse.json({ 
      success: true, 
      message: "Webhook test successful",
      received: body 
    })
  } catch (error) {
    console.error("❌ Test webhook error:", error)
    return NextResponse.json({ error: "Webhook test failed" }, { status: 500 })
  }
}