import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ScheduleCalendar } from "@/components/schedule-calendar"

export default async function AdminSchedulePage() {
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
            <h1 className="font-serif font-bold text-3xl text-primary">Cleaning Schedule</h1>
            <p className="text-muted-foreground">Manage appointments and track cleaning progress</p>
          </div>
          <ScheduleCalendar />
        </div>
      </main>
    </div>
  )
}
