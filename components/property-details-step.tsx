"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { QuoteFormData } from "./multi-step-form"

interface PropertyDetailsStepProps {
  formData: QuoteFormData
  updateFormData: (updates: Partial<QuoteFormData>) => void
  onNext: () => void
}

export function PropertyDetailsStep({ formData, updateFormData, onNext }: PropertyDetailsStepProps) {
  const isValid = formData.serviceType && formData.propertyType && formData.cleaningType && 
                 formData.bedrooms > 0 && formData.bathrooms > 0

  const serviceTypes = [
    { value: "residential", label: "Residential Cleaning" },
    { value: "commercial", label: "Commercial Cleaning" },
    { value: "deep", label: "Deep Cleaning" },
    { value: "post_construction", label: "Post-Construction" },
    { value: "move_in_out", label: "Move-in/Move-out" }
  ]

  const propertyTypes = [
    { value: "house", label: "House" },
    { value: "apartment", label: "Apartment" },
    { value: "condo", label: "Condo" },
    { value: "office", label: "Office" },
    { value: "retail", label: "Retail Store" },
    { value: "other", label: "Other" }
  ]

  const cleaningTypes = [
    { value: "standard", label: "Standard Cleaning", price: "Starting at $80" },
    { value: "deep", label: "Deep Cleaning", price: "Starting at $150" },
    { value: "post_construction", label: "Post-Construction", price: "Starting at $200" }
  ]

  const frequencyOptions = [
    { value: "one_time", label: "One Time" },
    { value: "weekly", label: "Weekly" },
    { value: "bi_weekly", label: "Bi-Weekly" },
    { value: "monthly", label: "Monthly" }
  ]

  const petOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" }
  ]

  return (
    <div className="space-y-6">
      {/* Service Type */}
      <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold text-primary">Service Type *</Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) => updateFormData({ serviceType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label className="text-base font-semibold text-primary">Property Type *</Label>
        <Select
          value={formData.propertyType}
          onValueChange={(value) => updateFormData({ propertyType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      </div>

      {/* Room Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold text-primary">Number of rooms *</Label>
          <Select
            value={formData.bedrooms.toString()}
            onValueChange={(value) => updateFormData({ bedrooms: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rooms" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Bedroom" : "rooms"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-primary">Number of Bathrooms *</Label>
          <Select
            value={formData.bathrooms.toString()}
            onValueChange={(value) => updateFormData({ bathrooms: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bathrooms" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1? "Bathroom" : "Bathrooms"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Square Footage */}
      <div className="space-y-2">
        <Label htmlFor="squareFootage" className="text-base font-semibold text-primary">
          Square Footage (approx.)
        </Label>
        <Input
          id="squareFootage"
          type="number"
          placeholder="e.g., 1200"
          value={formData.squareFootage || ""}
          onChange={(e) => updateFormData({ squareFootage: Number.parseInt(e.target.value) || 0 })}
        />
      </div>

      {/* Cleaning Type */}
      <div className="space-y-2">
        <Label className="text-base font-semibold text-primary">Cleaning Type *</Label>
        <Select
          value={formData.cleaningType}
          onValueChange={(value) => updateFormData({ cleaningType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select cleaning type" />
          </SelectTrigger>
          <SelectContent>
            {cleaningTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{type.label}</span>
                  <span className="text-sm text-muted-foreground">{type.price}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cleaning Frequency */}
      <div className="space-y-2">
        <Label className="text-base font-semibold text-primary">Cleaning Frequency</Label>
        <Select
          value={formData.cleaningFrequency}
          onValueChange={(value) => updateFormData({ cleaningFrequency: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="How often do you need cleaning?" />
          </SelectTrigger>
          <SelectContent>
            {frequencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pets in Home */}
      <div className="space-y-2">
        <Label className="text-base font-semibold text-primary">Pets in Home</Label>
        <Select
          value={formData.hasPets}
          onValueChange={(value) => updateFormData({ hasPets: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Do you have pets?" />
          </SelectTrigger>
          <SelectContent>
            {petOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desired Date */}
      <div className="space-y-2">
        <Label htmlFor="desiredDate" className="text-base font-semibold text-primary">
          Preferred Date
        </Label>
        <Input
          id="desiredDate"
          type="date"
          value={formData.desiredDate}
          onChange={(e) => updateFormData({ desiredDate: e.target.value })}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
        >
          Continue to Additional Services
        </Button>
      </div>
    </div>
  )
}