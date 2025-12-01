// app/cleaner/register/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function CleanerRegistrationPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    business_name: "",
    phone: "",
    address: "",
    service_areas: [] as string[],
    services_offered: [] as string[],
    experience_years: "",
    hourly_rate: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const serviceAreas = [
    "Downtown", "North Side", "South Side", "East End", "West End", "Suburbs"
  ]

  const services = [
    "Residential Cleaning",
    "Commercial Cleaning",
    "Deep Cleaning",
    "Move-in/Move-out Cleaning",
    "Post-Construction Cleaning",
    "Carpet Cleaning",
    "Window Cleaning"
  ]

  const handleServiceAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      service_areas: prev.service_areas.includes(area)
        ? prev.service_areas.filter(a => a !== area)
        : [...prev.service_areas, area]
    }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.includes(service)
        ? prev.services_offered.filter(s => s !== service)
        : [...prev.services_offered, service]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/cleaner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert("Registration submitted! We'll review your application and contact you soon.")
        router.push("/cleaner/login?message=Registration submitted! Please wait for approval.")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Become a CleanHome Partner</CardTitle>
            <CardDescription>
              Join our network of professional cleaners and grow your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields remain the same as before */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input  
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>  
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div> 
                  <Label className="mb-2 block font-medium">Service Areas *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {serviceAreas.map(area => (
                      <div key={area} className="flex items-center">
                        <Checkbox
                          id={`area-${area}`}
                          checked={formData.service_areas.includes(area)}
                          onCheckedChange={() => handleServiceAreaToggle(area)}
                        />
                        <Label htmlFor={`area-${area}`} className="ml-2">{area}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div> 
                  <Label className="mb-2 block font-medium">Services Offered *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {services.map(service => (
                      <div key={service} className="flex items-center">
                        <Checkbox
                          id={`service-${service}`}
                          checked={formData.services_offered.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}  
                        />
                        <Label htmlFor={`service-${service}`} className="ml-2">{service}</Label>
                      </div>  
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience *</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0" 
                      value={formData.experience_years}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Expected Hourly Rate ($) *</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="0"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      required
                    />
                  </div>
                </div>


                {/* Rest of the form fields... */}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Already have an account? </p>
                <Link 
                  href="/cleaner/login" 
                  className="text-accent hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}