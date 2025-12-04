"use client"

import { useState } from "react"
import { ProfileHeader } from "./profile-header"
import { ProfileStats } from "./profile-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, User, Settings, Shield, Activity, Key } from "lucide-react"

interface AdminProfileProps {
  user: any
}

export function AdminProfile({ user }: AdminProfileProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "admin",
    permissions: user.permissions || ["read", "write", "delete"]
  })

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsEditing(false)
        alert("Profile updated successfully!")
      } else {
        alert("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: "Total Users", value: user.total_users || 0, description: "All platform users" },
    { label: "Active Cleaners", value: user.active_cleaners || 0, description: "Approved cleaners" },
    { label: "Total Quotes", value: user.total_quotes || 0, description: "All time" },
    { label: "Revenue", value: `$${user.total_revenue || 0}`, description: "This month" }
  ]

  const systemInfo = [
    { label: "Admin Since", value: new Date(user.created_at).toLocaleDateString() },
    { label: "Last Login", value: user.last_login ? new Date(user.last_login).toLocaleString() : "Never" },
    { label: "IP Address", value: user.last_ip || "N/A" },
    { label: "User Agent", value: user.user_agent ? user.user_agent.substring(0, 30) + "..." : "N/A" }
  ]

  return (
    <div className="space-y-6">
      <ProfileHeader
        name={user.name}
        email={user.email}
        role="admin"
        avatarUrl={user.avatar_url}
        status="active"
        lastLogin={user.last_login}
      />

      <ProfileStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Admin Information</CardTitle>
                  <CardDescription>
                    Update your admin profile details
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Admin Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {isEditing && (
                <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Your admin account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemInfo.map((info) => (
                  <div key={info.label} className="space-y-1">
                    <Label className="text-sm text-muted-foreground">{info.label}</Label>
                    <p className="font-medium">{info.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure your admin preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive admin notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-approve Cleaners</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve new cleaners</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your admin security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input id="current_password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input id="confirm_password" type="password" />
                </div>
                <Button>Change Password</Button>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.recent_activity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.timestamp && new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}