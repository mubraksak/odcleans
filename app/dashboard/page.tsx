import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserDashboard } from "@/components/user-dashboard"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) {
    redirect("/login")
  }

  // Note: In a real app, you'd verify the session here
  // For now, we'll let the client-side components handle auth

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
}
