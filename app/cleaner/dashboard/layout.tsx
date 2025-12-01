
// app/cleaner/dashboard/layout.tsx
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyCleanerSession } from "@/lib/session-utils"
import { CleanerHeader } from "@/components/cleaner-header"

export default async function CleanerProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const cleanerSession = cookieStore.get("cleaner_session")?.value

  console.log("🔍 Checking cleaner session in PROTECTED layout...")

  if (!cleanerSession) {
    console.log("❌ No cleaner session found, redirecting to login")
    redirect("/cleaner/login?message=Please login to access the dashboard")
  }

  const cleanerData = await verifyCleanerSession(cleanerSession)
  if (!cleanerData) {
    console.log("❌ Invalid cleaner session, redirecting to login")
    redirect("/cleaner/login?message=Session expired. Please login again.")
  }

  console.log("✅ Cleaner session valid for:", cleanerData.email)

  return (
    <div className="min-h-screen bg-background">
      <CleanerHeader cleanerData={cleanerData} />
      <div className="container mx-auto p-4 lg:p-6">
        {children}
      </div>
    </div>
  )
}