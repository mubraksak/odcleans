// app/admin/profile/page.tsx
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { query } from "@/lib/database"
import { Shield, Mail, User, Calendar, Key, Globe } from "lucide-react"

export default async function AdminProfilePage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value // Admins also use "session" cookie

  if (!sessionToken) {
    console.log("No admin session token found")
    redirect("/admin/login")
  }

  try {
    // First, check if user exists with this session token
    const [userData] = (await query(
      `SELECT 
        id, email, name, 
        role, created_at, 
        session_token, session_expires
      FROM admin_users 
      WHERE session_token = ? AND session_expires > NOW()`,
      [sessionToken]
    )) as any[]

    if (!userData) {
      console.log("Invalid or expired session token")
      redirect("/admin/login")
    }

    // Check if user is an admin
    if (userData.role !== 'admin') {
      console.log("User is not an admin, role:", userData.role)
      redirect("/admin/login")
    }

    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-serif font-bold text-3xl text-primary mb-2">Admin Profile</h1>
              <p className="text-muted-foreground">Manage your administrator account</p>
            </div>

            <div className="grid gap-6">
              {/* Admin Information Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Administrator Information</CardTitle>
                    <CardDescription>Your admin account details</CardDescription>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                    <Shield className="h-3 w-3 mr-1" /> Administrator
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Full Name</Label>
                      <div className="flex items-center p-2 border rounded-md bg-muted/50">
                        <User className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="ml-2">{userData.name}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email Address</Label>
                      <div className="flex items-center p-2 border rounded-md bg-muted/50">
                        <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="ml-2">{userData.email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Admin Since</Label>
                      <div className="flex items-center p-2 border rounded-md bg-muted/50">
                        <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="ml-2">
                          {new Date(userData.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Permissions Level</Label>
                      <div className="p-2 border rounded-md bg-muted/50">
                        <span>{userData.permissions || "Full Access"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Update your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button>
                    <Key className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* System Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Technical details about your session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Admin ID</Label>
                      <p className="font-mono text-sm">{userData.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Last Login IP</Label>
                      <p className="font-mono text-sm">{userData.last_ip || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">User Agent</Label>
                      <p className="text-sm truncate">{userData.user_agent || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Account Role</Label>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="capitalize">{userData.role}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline">
                      <Globe className="h-4 w-4 mr-2" />
                      View System Logs
                    </Button>
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Permissions
                    </Button>
                    <Button variant="outline">
                      View All Users
                    </Button>
                    <Button variant="outline">
                      System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Admin profile page error:", error)
    redirect("/admin/login")
  }
}