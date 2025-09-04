"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SiteConfig {
  id: number
  heroTitle: string
  heroSubtitle: string
}

interface Service {
  id: number
  name: string
  description: string
  displayOrder: number
  isActive: boolean
}

interface Testimonial {
  id: number
  clientName: string
  quote: string
  imageUrl?: string
  displayOrder: number
  isActive: boolean
}

export function CMSManager() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  // Form states
  const [heroTitle, setHeroTitle] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [newService, setNewService] = useState({ name: "", description: "" })
  const [newTestimonial, setNewTestimonial] = useState({ clientName: "", quote: "", imageUrl: "" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [configRes, servicesRes, testimonialsRes] = await Promise.all([
        fetch("/api/admin/cms/site-config"),
        fetch("/api/admin/cms/services"),
        fetch("/api/admin/cms/testimonials"),
      ])

      if (configRes.ok) {
        const configData = await configRes.json()
        setSiteConfig(configData.siteConfig)
        if (configData.siteConfig) {
          setHeroTitle(configData.siteConfig.heroTitle)
          setHeroSubtitle(configData.siteConfig.heroSubtitle)
        }
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData.services)
      }

      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json()
        setTestimonials(testimonialsData.testimonials)
      }
    } catch (error) {
      console.error("Error fetching CMS data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSiteConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/cms/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroTitle, heroSubtitle }),
      })

      if (response.ok) {
        setMessage("Site configuration updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error saving site config:", error)
    } finally {
      setSaving(false)
    }
  }

  const addService = async () => {
    if (!newService.name || !newService.description) return

    try {
      const response = await fetch("/api/admin/cms/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newService.name,
          description: newService.description,
          displayOrder: services.length,
        }),
      })

      if (response.ok) {
        setNewService({ name: "", description: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Error adding service:", error)
    }
  }

  const updateService = async (id: number, updates: Partial<Service>) => {
    try {
      const response = await fetch(`/api/admin/cms/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error updating service:", error)
    }
  }

  const deleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const response = await fetch(`/api/admin/cms/services/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }

  const addTestimonial = async () => {
    if (!newTestimonial.clientName || !newTestimonial.quote) return

    try {
      const response = await fetch("/api/admin/cms/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: newTestimonial.clientName,
          quote: newTestimonial.quote,
          imageUrl: newTestimonial.imageUrl || null,
          displayOrder: testimonials.length,
        }),
      })

      if (response.ok) {
        setNewTestimonial({ clientName: "", quote: "", imageUrl: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Error adding testimonial:", error)
    }
  }

  const updateTestimonial = async (id: number, updates: Partial<Testimonial>) => {
    try {
      const response = await fetch(`/api/admin/cms/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error updating testimonial:", error)
    }
  }

  const deleteTestimonial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const response = await fetch(`/api/admin/cms/testimonials/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
    }
  }

  if (loading) {
    return <div className="p-6">Loading CMS data...</div>
  }

  return (
    <div className="space-y-8">
      {message && (
        <Alert className="border-accent/20 bg-accent/5">
          <AlertDescription className="text-accent">{message}</AlertDescription>
        </Alert>
      )}

      {/* Site Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Site Configuration</CardTitle>
          <CardDescription>Update the hero section content on your landing page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Hero Title</Label>
            <Input
              id="heroTitle"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Enter hero title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Textarea
              id="heroSubtitle"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Enter hero subtitle"
              rows={3}
            />
          </div>

          <Button
            onClick={saveSiteConfig}
            disabled={saving}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Services Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Services Management</CardTitle>
          <CardDescription>Manage the services displayed on your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Service */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-primary">Add New Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., Standard Cleaning"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe the service..."
                  rows={2}
                />
              </div>
            </div>
            <Button onClick={addService} variant="outline" className="bg-transparent">
              Add Service
            </Button>
          </div>

          {/* Existing Services */}
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-primary">{service.name}</h4>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={(checked) => updateService(service.id, { ...service, isActive: checked })}
                    />
                    <Button variant="destructive" size="sm" onClick={() => deleteService(service.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Testimonials Management</CardTitle>
          <CardDescription>Manage customer testimonials displayed on your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Testimonial */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-primary">Add New Testimonial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input
                  value={newTestimonial.clientName}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, clientName: e.target.value })}
                  placeholder="e.g., Sarah Johnson"
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL (Optional)</Label>
                <Input
                  value={newTestimonial.imageUrl}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Testimonial Quote</Label>
              <Textarea
                value={newTestimonial.quote}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                placeholder="Enter the customer's testimonial..."
                rows={3}
              />
            </div>
            <Button onClick={addTestimonial} variant="outline" className="bg-transparent">
              Add Testimonial
            </Button>
          </div>

          {/* Existing Testimonials */}
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-primary">{testimonial.clientName}</h4>
                    <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                      {testimonial.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={testimonial.isActive}
                      onCheckedChange={(checked) =>
                        updateTestimonial(testimonial.id, { ...testimonial, isActive: checked })
                      }
                    />
                    <Button variant="destructive" size="sm" onClick={() => deleteTestimonial(testimonial.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">"{testimonial.quote}"</p>
                {testimonial.imageUrl && <p className="text-xs text-muted-foreground">Image: {testimonial.imageUrl}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
