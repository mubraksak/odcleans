import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ClientsTable } from "@/components/user-table"

export default async function AdminClientsPage() {
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
            <h1 className="font-serif font-bold text-3xl text-primary">Client Management</h1>
            <p className="text-muted-foreground">View and manage your customer relationships</p>
          </div>
          {/* <div className="text-center py-12">
            <p className="text-muted-foreground">Client management interface coming soon...</p>
          </div> */}
           <ClientsTable />
        </div>
       
      </main>
    </div>
  )
}
