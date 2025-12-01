import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { CleanersManagement } from "@/components/cleaners-management"
import { AssignmentsManagement } from "@/components/assignments-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { AssignmentsManagement } from "@/components/assignments-management"

export default async function AdminDashboardPage() {
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
            <h1 className="font-serif font-bold text-3xl text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your cleaning service business</p>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cleaners">Cleaners</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <DashboardOverview />
            </TabsContent>
            
            <TabsContent value="cleaners">
              <CleanersManagement />
            </TabsContent>
            
            <TabsContent value="assignments">
              <AssignmentsManagement />
            </TabsContent>
            
          </Tabs>
        </div>
      </main>
    </div>
  )
}