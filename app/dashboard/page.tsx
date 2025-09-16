import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserDashboard } from "@/components/user-dashboard"
import { query } from "@/lib/database"
// import { generateToken } from "@/lib/auth-utils"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) {
    redirect("/login")
  }

  // Note: In a real app, you'd verify the session here
  // For now, we'll let the client-side components handle auth
  // Verify the session token against the database

  try {
    // Check if session token is valid and not expired
    const users = (await query(
      "SELECT id, email, name FROM users WHERE session_token = ? AND session_expires > NOW()",
      [sessionToken],
    )) as any[]

    if (users.length === 0) {
      // Invalid or expired session
      redirect("/login")
    }

    const user = users[0]
  


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <UserDashboard />
        </div>
      </main>

      <Footer />
    </div>
  )
} catch (error) {
    console.error("Session verification failed:", error)
    redirect("/login")
  }
}
