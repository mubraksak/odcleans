"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuoteFormData } from "./multi-step-form"

interface ContactDetailsStepProps {
  formData: QuoteFormData
  updateFormData: (updates: Partial<QuoteFormData>) => void
  onNext: () => void
  onPrev: () => void
}

export function ContactDetailsStep({ formData, updateFormData, onNext, onPrev }: ContactDetailsStepProps) {
  const isValid = formData.name && formData.email && formData.phone && 
                 formData.streetAddress && formData.city && formData.state && formData.zipCode

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ]

  return (
    <div className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold text-primary">
          Full Name *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base font-semibold text-primary">
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          required
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base font-semibold text-primary">
          Phone Number *
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          required
        />
      </div>

      {/* Street Address */}
      <div className="space-y-2">
        <Label htmlFor="streetAddress" className="text-base font-semibold text-primary">
          Street Address *
        </Label>
        <Input
          id="streetAddress"
          type="text"
          placeholder="123 Main St"
          value={formData.streetAddress}
          onChange={(e) => updateFormData({ streetAddress: e.target.value })}
          required
        />
      </div>

      {/* City, State, Zip Code */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-base font-semibold text-primary">
            City *
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-base font-semibold text-primary">
            State *
          </Label>
          <Select
            value={formData.state}
            onValueChange={(value) => updateFormData({ state: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode" className="text-base font-semibold text-primary">
          Zip Code *
        </Label>
        <Input
          id="zipCode"
          type="text"
          placeholder="12345"
          value={formData.zipCode}
          onChange={(e) => updateFormData({ zipCode: e.target.value })}
          required
        />
      </div>

      {/* Special Instructions */}
      <div className="space-y-2">
        <Label htmlFor="specialInstructions" className="text-base font-semibold text-primary">
          Special Instructions
        </Label>
        <Textarea
          id="specialInstructions"
          placeholder="Any specific requirements, areas of focus, or special instructions..."
          value={formData.specialInstructions}
          onChange={(e) => updateFormData({ specialInstructions: e.target.value })}
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
          Back to Additional Services
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
        >
          Review Quote Request
        </Button>
      </div>
    </div>
  )
}