"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Eye, EyeOff, ImageIcon } from "lucide-react"
import type { Service } from "@/lib/types"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function ServicesManagementPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    
    
    displayOrder: 0,
    isActive: true
  })

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      displayOrder: 0,
      isActive: true
    })
    setEditingService(null)
  }

  // Create or update service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingService 
        ? `/api/admin/services/${editingService.id}`
        : "/api/admin/services"
      
      const method = editingService ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchServices() // Refresh the list
      }
    } catch (error) {
      console.error("Error saving service:", error)
    }
  }

  // Edit service
  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      image_url: service.image_url || "",
      displayOrder: service.displayOrder || 0,
      isActive: service.isActive
    })
    setIsDialogOpen(true)
  }

  // Delete service
  const handleDelete = async () => {
    if (!editingService) return

    try {
      const response = await fetch(`/api/admin/services/${editingService.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setEditingService(null)
        fetchServices() // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }

  // Toggle service status
  const toggleServiceStatus = async (service: Service) => {
    try {
      const response = await fetch(`/api/admin/services/${service.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !service.isActive }),
      })

      if (response.ok) {
        fetchServices() // Refresh the list
      }
    } catch (error) {
      console.error("Error toggling service status:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading services...</div>
      </div>
    )
  }

  return (
   <div className="flex h-screen bg-background">
     <AdminSidebar />
     <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Services Management</h1>
          <p className="text-muted-foreground">Manage your cleaning services</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Service
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription>
                {editingService 
                  ? "Update the service details below."
                  : "Add a new service to your offerings."
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Title</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Standard Cleaning"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <Input
                    name="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the service in detail..."
                  rows={4}
                  required
                />
              </div>


                

              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={handleSwitchChange}
                />
                <label className="text-sm font-medium">
                  Active Service
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingService ? "Update Service" : "Create Service"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </div>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {service.image_url && (
                  <div className="relative h-32 rounded-md overflow-hidden bg-muted">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">{service.priceRange || "Not set"}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{service.duration || "Not set"}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order:</span>
                  <span className="font-medium">{service.displayOrder}</span>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleServiceStatus(service)}
                  >
                    {service.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {service.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog open={isDeleteDialogOpen && editingService?.id === service.id} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setEditingService(service)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the service "{service.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No services found. Add your first service to get started.</p>
        </div>
      )}
   </div> 
    </main>

    </div>
  )
}