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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, User, Briefcase, Shield, Award, Truck } from "lucide-react"

interface CleanerProfileProps {
  user: any
  cleaner: any
}

export function CleanerProfile({ user, cleaner }: CleanerProfileProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    business_name: cleaner.business_name || "",
    phone: user.phone || cleaner.phone || "",
    address: cleaner.address || "",
    experience_years: cleaner.experience_years || "",
    hourly_rate: cleaner.hourly_rate || "",
    bio: cleaner.bio || "",
    service_areas: Array.isArray(cleaner.service_areas) ? cleaner.service_areas : [],
    services_offered: Array.isArray(cleaner.services_offered) ? cleaner.services_offered : [],
    equipment_list: Array.isArray(cleaner.equipment_list) ? cleaner.equipment_list : [],
    certifications: Array.isArray(cleaner.certifications) ? cleaner.certifications : [],
    insurance_verified: cleaner.insurance_verified || false,
    background_check: cleaner.background_check || false,
    preferred_communication: cleaner.preferred_communication || "email"
  })

  const serviceAreas = [
    "Downtown", "North Side", "South Side", "East End", "West End", "Suburbs", "Rural"
  ]

  const services = [
    "Residential Cleaning", "Commercial Cleaning", "Deep Cleaning", 
    "Move-in/Move-out Cleaning", "Post-Construction Cleaning", 
    "Carpet Cleaning", "Window Cleaning", "Upholstery Cleaning"
  ]

  const equipment = [
    "Vacuum Cleaner", "Steam Cleaner", "Floor Buffer", "Pressure Washer",
    "Window Cleaning Kit", "Ladder", "Professional Cleaning Chemicals",
    "Microfiber Cloths", "Mop and Bucket"
  ]

  const certifications = [
    "IICRC Certified", "OSHA Safety Certified", "Green Cleaning Certified",
    "Carpet Cleaning Certified", "Mold Remediation Certified"
  ]

  const handleArrayToggle = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cleaner/profile", {
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
    { label: "Total Jobs", value: cleaner.total_assignments || 0, description: "All time" },
    { label: "Completed Jobs", value: cleaner.completed_assignments || 0, description: "Finished cleanings" },
    { label: "Total Earnings", value: `$${cleaner.total_earnings || 0}`, description: "Lifetime earnings" },
    { label: "Avg Rating", value: cleaner.avg_rating ? cleaner.avg_rating.toFixed(1) : "N/A", description: "Customer reviews" }
  ]

  const verificationStatus = [
    { label: "Account Status", status: cleaner.status, icon: "✅" },
    { label: "Insurance", status: cleaner.insurance_verified ? "verified" : "not verified", icon: "📄" },
    { label: "Background Check", status: cleaner.background_check ? "passed" : "pending", icon: "🔒" }
  ]

  return (
    <div className="space-y-6">
      <ProfileHeader
        name={user.name}
        email={user.email}
        role="cleaner"
        avatarUrl={cleaner.profile_image || user.avatar_url}
        businessName={cleaner.business_name}
        status={cleaner.status}
        lastLogin={user.last_login}
      />

      <ProfileStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Equipment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your business details and contact information
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
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio/Description</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell customers about yourself and your cleaning philosophy..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Communication</Label>
                  <Select 
                    value={formData.preferred_communication}
                    onValueChange={(value) => setFormData({...formData, preferred_communication: value})}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
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
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Areas & Offerings</CardTitle>
              <CardDescription>Select the areas you serve and services you offer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Service Areas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serviceAreas.map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        checked={formData.service_areas.includes(area)}
                        onChange={() => setFormData({
                          ...formData, 
                          service_areas: handleArrayToggle(formData.service_areas, area)
                        })}
                        disabled={!isEditing}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`area-${area}`} className="text-sm">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Services Offered</Label>
                <div className="grid grid-cols-1 gap-2">
                  {services.map(service => (
                    <div key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`service-${service}`}
                        checked={formData.services_offered.includes(service)}
                        onChange={() => setFormData({
                          ...formData, 
                          services_offered: handleArrayToggle(formData.services_offered, service)
                        })}
                        disabled={!isEditing}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`service-${service}`} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Your account verification and trust status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {verificationStatus.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <Badge variant={
                          item.status === "approved" || item.status === "verified" || item.status === "passed" 
                            ? "default" 
                            : "secondary"
                        }>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Insurance Verification</Label>
                    <p className="text-sm text-muted-foreground">Upload insurance documents</p>
                  </div>
                  <Switch 
                    checked={formData.insurance_verified}
                    onCheckedChange={(checked) => setFormData({...formData, insurance_verified: checked})}
                    disabled={!isEditing || formData.insurance_verified}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Background Check</Label>
                    <p className="text-sm text-muted-foreground">Submit background check</p>
                  </div>
                  <Switch 
                    checked={formData.background_check}
                    onCheckedChange={(checked) => setFormData({...formData, background_check: checked})}
                    disabled={!isEditing || formData.background_check}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment & Certifications</CardTitle>
              <CardDescription>List your cleaning equipment and certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Equipment List</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {equipment.map(item => (
                    <div key={item} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`equipment-${item}`}
                        checked={formData.equipment_list.includes(item)}
                        onChange={() => setFormData({
                          ...formData, 
                          equipment_list: handleArrayToggle(formData.equipment_list, item)
                        })}
                        disabled={!isEditing}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`equipment-${item}`} className="text-sm">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Certifications</Label>
                <div className="grid grid-cols-1 gap-2">
                  {certifications.map(cert => (
                    <div key={cert} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`cert-${cert}`}
                        checked={formData.certifications.includes(cert)}
                        onChange={() => setFormData({
                          ...formData, 
                          certifications: handleArrayToggle(formData.certifications, cert)
                        })}
                        disabled={!isEditing}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`cert-${cert}`} className="text-sm">{cert}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}