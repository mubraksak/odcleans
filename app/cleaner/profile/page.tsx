// app/cleaner/profile/page.tsx - FIXED VERSION
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { query } from "@/lib/database"
import { 
  Building, Phone, Mail, MapPin, Briefcase, 
  DollarSign, Star, Calendar, CheckCircle, 
  XCircle, Clock, Shield
} from "lucide-react"
import { CleanerHeader } from "@/components/cleaner-header"

export default async function CleanerProfilePage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("cleaner_session")?.value  // Changed from "cleaner_session"

  if (!sessionToken) {
    console.log("No session token found")
    redirect("/cleaner/login")
  }

  console.log("Session token found, checking database...")

  try {
    // Get user data from users table
    const users = (await query(
      `SELECT 
        id, email, name, 
        phone, role, session_expires
      FROM users 
      WHERE session_token = ?`,
      [sessionToken]
    )) as any[]

    console.log(`Found ${users.length} users with this token`)

    if (users.length === 0) {
      console.log("No user found with this session token")
      redirect("/cleaner/login")
    }

    const userData = users[0]
    console.log("User role:", userData.role)

    // Check session expiry
    if (new Date(userData.session_expires) < new Date()) {
      console.log("Session expired")
      redirect("/cleaner/login")
    }

    // Check if user is a cleaner
    if (userData.role !== 'cleaner') {
      console.log(`User is not a cleaner. Role: ${userData.role}`)
      redirect("/cleaner/login")
    }

    // Get cleaner details from cleaners table
    const [cleanerData] = (await query(
      `SELECT * FROM cleaners WHERE user_id = ?`,
      [userData.id]
    )) as any[]

    console.log("Cleaner data found:", !!cleanerData)

    if (!cleanerData) {
      console.log("No cleaner profile found for this user")
      redirect("/cleaner/login")
    }

    // Get cleaner stats
    const [stats] = (await query(
      `SELECT 
        COUNT(DISTINCT ca.id) as total_assignments,
        COUNT(DISTINCT CASE WHEN ca.status IN ('assigned', 'in_progress') THEN ca.id END) as active_assignments,
        COUNT(DISTINCT CASE WHEN ca.status = 'completed' THEN ca.id END) as completed_assignments,
        SUM(CASE WHEN ca.payment_status = 'paid' THEN ca.payment_amount ELSE 0 END) as total_earnings
      FROM cleaner_assignments ca
      WHERE ca.cleaner_id = ?`,
      [cleanerData.id]
    )) as any[]

    const getStatusBadge = (status: string) => {
      switch(status?.toLowerCase()) {
        case 'approved':
          return <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        case 'rejected':
          return <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        default:
          return <Badge variant="outline">{status}</Badge>
      }
    }

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <CleanerHeader cleanerData={cleanerData} />
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif font-bold text-3xl text-primary mb-2">Cleaner Profile</h1>
                <p className="text-muted-foreground">Manage your cleaning business information</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(cleanerData.status)}
                <Badge variant="outline" className="w-fit">
                  <Shield className="h-3 w-3 mr-1" />
                  Cleaner Account
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Column - Stats & Status */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Jobs</span>
                      <span className="font-semibold">{stats?.total_assignments || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Jobs</span>
                      <span className="font-semibold">{stats?.active_assignments || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-semibold">{stats?.completed_assignments || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Earnings</span>
                      <span className="font-semibold">${stats?.total_earnings || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Available for Jobs</Label>
                      <p className="text-sm text-muted-foreground">
                        {cleanerData.is_available ? "Accepting new jobs" : "Not available"}
                      </p>
                    </div>
                    <Switch checked={cleanerData.is_available} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Your cleaning business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Business Name</Label>
                        <div className="flex items-center p-3 border rounded-md">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{cleanerData.business_name}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <div className="p-3 border rounded-md">
                          <span>{userData.name}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="flex items-center p-3 border rounded-md">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{userData.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Hourly Rate</Label>
                        <div className="flex items-center p-3 border rounded-md">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>${cleanerData.hourly_rate}/hour</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Experience</Label>
                        <div className="flex items-center p-3 border rounded-md">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{cleanerData.experience_year || 0} years</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex items-center p-3 border rounded-md">
                          <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{cleanerData.rating || "No ratings yet"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <div className="flex items-center p-3 border rounded-md">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{cleanerData.phone || userData.phone || "Not provided"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <div className="flex items-center p-3 border rounded-md">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{new Date(cleanerData.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Address</Label>
                    <div className="flex items-start p-3 border rounded-md">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground flex-shrink-0" />
                      <span>{cleanerData.address || "No address provided"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Areas</Label>
                    <div className="p-3 border rounded-md">
                      <span>{cleanerData.service_areas || "No service areas specified"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Services Offered</Label>
                    <div className="p-3 border rounded-md">
                      <span>{cleanerData.services_offered || "No services specified"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Business Information</CardTitle>
                  <CardDescription>Edit your business details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-name">Business Name *</Label>
                        <Input 
                          id="business-name" 
                          defaultValue={cleanerData.business_name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourly-rate">Hourly Rate ($) *</Label>
                        <Input 
                          id="hourly-rate" 
                          type="number" 
                          defaultValue={cleanerData.hourly_rate}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue={cleanerData.phone} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input 
                          id="experience" 
                          type="number" 
                          defaultValue={cleanerData.experience_year}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Input id="address" defaultValue={cleanerData.address} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="service-areas">Service Areas (comma-separated)</Label>
                      <Input id="service-areas" defaultValue={cleanerData.service_areas} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="services">Services Offered</Label>
                      <Textarea 
                        id="services" 
                        defaultValue={cleanerData.services_offered}
                        placeholder="List your cleaning services..."
                        rows={3}
                      />
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
      </div>
    )
  } catch (error) {
    // console.error("Cleaner profile error:", error)
    // console.error("Error details:", error.message)
    redirect("/cleaner/login")
  }
}