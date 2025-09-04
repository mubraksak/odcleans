import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin-sidebar"
import { QuotesTable } from "@/components/quotes-table"

export default async function AdminQuotesPage() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")?.value

  if (!adminSession) {
    redirect("/admin/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="font-serif font-bold text-3xl text-primary">Quote Management</h1>
            <p className="text-muted-foreground">Review and respond to customer quote requests</p>
          </div>
          <QuotesTable />
        </div>
      </main>
    </div>
  )
}
