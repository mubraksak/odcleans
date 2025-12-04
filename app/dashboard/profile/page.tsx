// app/dashboard/profile/page.tsx - FINAL VERSION
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { query } from "@/lib/database"
import { PenLine, Phone, Mail, MapPin, Calendar, Shield, CreditCard } from "lucide-react"

export default async function CustomerProfilePage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  
  if (!sessionToken) {
    redirect("/login")
  }

  try {
    // Get user data
    const users = (await query(
      `SELECT 
        id, email, name, 
        phone,
        created_at, last_ip,
        email_verified, role, session_expires
      FROM users 
      WHERE session_token = ?`,
      [sessionToken]
    )) as any[]

    if (users.length === 0) {
      redirect("/login")
    }

    const userData = users[0]

    // Check if session is expired
    if (new Date(userData.session_expires) < new Date()) {
      redirect("/login")
    }

    // Only allow customers
    if (userData.role !== 'customer') {
      redirect("/login")
    }

    // Get customer stats
    const [stats] = (await query(
      `SELECT 
        COUNT(DISTINCT qr.id) as total_quotes,
        COUNT(DISTINCT CASE WHEN qr.status IN ('pending', 'in_progress') THEN qr.id END) as active_quotes,
        COUNT(DISTINCT t.id) as total_transactions,
        SUM(t.amount) as total_spent
      FROM users u
      LEFT JOIN quote_requests qr ON u.id = qr.user_id
      LEFT JOIN transactions t ON qr.id = t.quote_id
      WHERE u.id = ?
      GROUP BY u.id`,
      [userData.id]
    )) as any[]

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Profile Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif font-bold text-3xl text-primary mb-2">My Profile</h1>
                  <p className="text-muted-foreground">Manage your account information and preferences</p>
                </div>
                <Badge variant="outline" className="w-fit">
                  <Shield className="h-3 w-3 mr-1" />
                  Customer Account
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Stats */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Quotes</span>
                        <span className="font-semibold">{stats?.total_quotes || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active Quotes</span>
                        <span className="font-semibold">{stats?.active_quotes || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Spent</span>
                        <span className="font-semibold">${stats?.total_spent || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment History
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Request New Quote
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      View My Quotes
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Profile Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your contact details</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <PenLine className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <div className="flex items-center p-3 border rounded-md">
                            <span>{userData.name}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <div className="flex items-center p-3 border rounded-md">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{userData.email}</span>
                            {userData.email_verified && (
                              <Badge className="ml-auto bg-green-100 text-green-800">
                                Verified
                              </Badge>
                             )
                            } 
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <div className="flex items-center p-3 border rounded-md">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{userData.phone || "Not provided"}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Member Since</Label>
                          <div className="flex items-center p-3 border rounded-md">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{new Date(userData.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address</Label>
                      <div className="flex items-start p-3 border rounded-md">
                        <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p>{userData.address || "No address provided"}</p>
                          {userData.city && userData.state && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {userData.city}, {userData.state} {userData.zip_code}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Update Information Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Update Information</CardTitle>
                    <CardDescription>Edit your profile details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Full Name</Label>
                          <Input id="edit-name" defaultValue={userData.name} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">Phone Number</Label>
                          <Input id="edit-phone" defaultValue={userData.phone} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email Address</Label>
                        <Input id="edit-email" type="email" defaultValue={userData.email} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-address">Address</Label>
                        <Input id="edit-address" defaultValue={userData.address} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-city">City</Label>
                          <Input id="edit-city" defaultValue={userData.city} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-state">State</Label>
                          <Input id="edit-state" defaultValue={userData.state} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-zip">ZIP Code</Label>
                          <Input id="edit-zip" defaultValue={userData.zip_code} />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <Button type="submit">Save Changes</Button>
                        <Button type="button" variant="outline">Cancel</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error("Profile page error:", error)
    redirect("/login")
  }
}