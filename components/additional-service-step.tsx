"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckboxField } from "@/components/ui/checkbox-field"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload } from "lucide-react"
import type { QuoteFormData, UploadedImage } from "./multi-step-form"
import { useState, useRef } from "react"

interface AdditionalServicesStepProps {
  formData: QuoteFormData
  updateFormData: (updates: Partial<QuoteFormData>) => void
  onNext: () => void
  onPrev: () => void
}

export function AdditionalServicesStep({ formData, updateFormData, onNext, onPrev }: AdditionalServicesStepProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(formData.images || [])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCheckboxChange = (field: keyof QuoteFormData, checked: boolean) => {
    updateFormData({ [field]: checked })
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newImages: UploadedImage[] = []
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file)
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl
        })
      }
    })

    setUploadedImages(prev => {
      const combined = [...prev, ...newImages]
      // Update parent form data with the new images array
      updateFormData({ images: combined })
      return combined
    })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      // Clean up object URLs
      const removed = prev.find(img => img.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl)
      }
      // Update parent form data
      updateFormData({ images: updated })
      return updated
    })
  }

  const additionalServices = [
    {
      id: "laundry",
      field: "laundry" as keyof QuoteFormData,
      label: "Laundry",
      description: "Washing, drying, and folding services"
    },
    {
      id: "foldingClothes",
      field: "foldingClothes" as keyof QuoteFormData,
      label: "Folding clothes",
      description: "Professional folding and organization"
    },
    {
      id: "fridgeCleaning",
      field: "fridgeCleaning" as keyof QuoteFormData,
      label: "Fridge cleaning",
      description: "Deep cleaning of refrigerator interior"
    },
    {
      id: "baseboardCleaning",
      field: "baseboardCleaning" as keyof QuoteFormData,
      label: "Baseboard cleaning",
      description: "Thorough cleaning of baseboards and trim"
    },
    {
      id: "cabinetCleaning",
      field: "cabinetCleaning" as keyof QuoteFormData,
      label: "Interior cabinet cleaning",
      description: "Cleaning inside cabinets and drawers"
    },
    {
      id: "windowCleaning",
      field: "windowCleaning" as keyof QuoteFormData,
      label: "Window cleaning (Interior)",
      description: "Cleaning of interior window surfaces"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Additional Services</h3>
        <p className="text-muted-foreground">Select any additional services you'd like to include:</p>

        {/* Checkbox Services */}
        <div className="grid gap-4">
          {additionalServices.map((service) => (
            <CheckboxField
              key={service.id}
              id={service.id}
              label={service.label}
              description={service.description}
              checked={Boolean(formData[service.field])}
              onCheckedChange={(checked) => handleCheckboxChange(service.field, checked)}
            />
          ))}
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold text-primary">
            Upload Cleaning Area Images
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Upload photos of areas that need special attention (max 10 images, 5MB each)
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-accent bg-accent/5' 
              : 'border-border hover:border-accent/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            
            <div>
              <p className="font-medium text-primary">
                Drop images here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PNG, JPG, JPEG up to 5MB each
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Select Files
            </Button>
          </div>
        </div>

        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-primary">
              Uploaded Images ({uploadedImages.length}/10)
            </Label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <Card key={image.id} className="relative group">
                  <CardContent className="p-2">
                    <div className="aspect-square relative rounded-md overflow-hidden bg-muted">
                      <img
                        src={image.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {image.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(image.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="space-y-2">
        <Label htmlFor="additionalDetails" className="text-base font-semibold text-primary">
          Additional Details
        </Label>
        <Textarea
          id="additionalDetails"
          placeholder="Any specific instructions or special requests for the additional services..."
          value={formData.additionalDetails}
          onChange={(e) => updateFormData({ additionalDetails: e.target.value })}
          rows={4}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Back to Property Details
        </Button>
        <Button
          onClick={onNext}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
        >
          Continue to Contact Details
        </Button>
      </div>
    </div>
  )
}