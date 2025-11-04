import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserQuoteDetails } from "@/components/user-quote-details"
import { query } from "@/lib/database"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserQuoteDetailPage({ params }: PageProps) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) {
    redirect("/login")
  }

  // Verify session
  const users = (await query(
    "SELECT id, email, name FROM users WHERE session_token = ? AND session_expires > NOW()",
    [sessionToken],
  )) as any[]

  if (users.length === 0) {
    redirect("/login")
  }

  const user = users[0]
  const { id } = await params
  const quoteId = parseInt(id)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <UserQuoteDetails quoteId={quoteId} user={user} />
        </div>
      </main>
      <Footer />
    </div>
  )
}