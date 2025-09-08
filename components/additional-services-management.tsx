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
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"
import type { AdditionalService, AdditionalServiceWithService, Service } from "@/lib/types"
import { AdminSidebar } from "@/components/admin-sidebar"

interface AdditionalServicesManagementProps {
  services: Service[]
}

export function AdditionalServicesManagement({ services }: AdditionalServicesManagementProps) {
  const [additionalServices, setAdditionalServices] = useState<AdditionalServiceWithService[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<AdditionalServiceWithService | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    service_id: "",
    description: "",
    base_price: "",
    unit: "flat rate",
    is_optional: true
  })

  // Fetch additional services
  const fetchAdditionalServices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/additional-services")
      if (response.ok) {
        const data = await response.json()
        setAdditionalServices(data.additionalServices)
      }
    } catch (error) {
      console.error("Error fetching additional services:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdditionalServices()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_optional: checked
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      service_id: "",
      description: "",
      base_price: "",
      unit: "flat rate",
      is_optional: true
    })
    setEditingService(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingService 
        ? `/api/admin/additional-services/${editingService.id}`
        : "/api/admin/additional-services"
      
      const method = editingService ? "PUT" : "POST"

      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        service_id: parseInt(formData.service_id)
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchAdditionalServices()
      }
    } catch (error) {
      console.error("Error saving additional service:", error)
    }
  }

  const handleEdit = (service: AdditionalServiceWithService) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      service_id: service.service_id.toString(),
      description: service.description,
      base_price: service.base_price.toString(),
      unit: service.unit,
      is_optional: service.is_optional
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!editingService) return

    try {
      const response = await fetch(`/api/admin/additional-services/${editingService.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setEditingService(null)
        fetchAdditionalServices()
      }
    } catch (error) {
      console.error("Error deleting additional service:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading additional services...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
    <AdminSidebar/>
    <main className="flex-1 overflow-auto">
    <div className="container mx-auto p-6">
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Additional Services Management</h1>
          <p className="text-muted-foreground">Manage add-on services and pricing</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Additional Service
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Additional Service" : "Add Additional Service"}
              </DialogTitle>
              <DialogDescription>
                {editingService 
                  ? "Update the additional service details below."
                  : "Add a new additional service with pricing."
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Main Service</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => handleSelectChange("service_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id?.toString() || ""}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Additional service Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., laundry,"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Window Cleaning, Carpet Shampooing"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    name="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleSelectChange("unit", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat rate">Flat Rate</SelectItem>
                      <SelectItem value="per hour">Per Hour</SelectItem>
                      <SelectItem value="per room">Per Room</SelectItem>
                      <SelectItem value="per square foot">Per Square Foot</SelectItem>
                      <SelectItem value="per item">Per Item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_optional}
                  onCheckedChange={handleSwitchChange}
                />
                <Label>Optional Service (Customer can choose)</Label>
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

      {/* Additional Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {additionalServices.map((service) => (
          <Card key={service.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                  {/* <CardTitle className="text-sm">{service.description}</CardTitle> */}
                  <CardDescription>
                    {service.description}
                  </CardDescription>
                </div>
                <Badge variant={service.is_optional ? "outline" : "default"}>
                  {service.is_optional ? "Optional" : "Required"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">
                    ${service.base_price} {service.unit !== 'flat rate' ? `/${service.unit}` : ''}
                  </span>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Badge variant="secondary" className="capitalize">
                    {service.unit}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog open={isDeleteDialogOpen && editingService?.id === service.id} onOpenChange={setIsDeleteDialogOpen}>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setEditingService(service)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the additional service "{service.description}". This action cannot be undone.
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

      {additionalServices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No additional services found. Add your first additional service to get started.</p>
        </div>
      )}
    </div>
     </div>
    </main>
    </div>
   
  )
}