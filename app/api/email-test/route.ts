// app/api/email-test/route.ts
import { NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function GET() {
  try {
    console.log('Testing email configuration...')
    console.log('SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Not set')
    console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? 'Set' : 'Not set')

    const success = await emailService.sendMagicLink(
      "test@example.com",
      "Test User",
      "test-token-123"
    )

    return NextResponse.json({
      success,
      message: success ? "Email test successful" : "Email test failed - check console",
      config: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER ? "Configured" : "Missing",
        smtpPassword: process.env.SMTP_PASSWORD ? "Configured" : "Missing",
      }
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: "Email test failed",
    //   details: error.message
    }, { status: 500 })
  }
}