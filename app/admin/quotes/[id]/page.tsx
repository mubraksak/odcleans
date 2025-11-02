import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin-sidebar"
import { QuoteDetails } from "@/components/quote-details"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")?.value

  if (!adminSession) {
    redirect("/admin/login")
  }

  const { id } = await params

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <QuoteDetails quoteId={parseInt(id)} />
        </div>
      </main>
    </div>
  )
}