"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckboxField } from "@/components/ui/checkbox-field"
import type { QuoteFormData } from "./multi-step-form"

interface AdditionalServicesStepProps {
  formData: QuoteFormData
  updateFormData: (updates: Partial<QuoteFormData>) => void
  onNext: () => void
  onPrev: () => void
}

export function AdditionalServicesStep({ formData, updateFormData, onNext, onPrev }: AdditionalServicesStepProps) {
  const handleCheckboxChange = (field: keyof QuoteFormData, checked: boolean) => {
    updateFormData({ [field]: checked })
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