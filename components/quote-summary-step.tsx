"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { QuoteFormData } from "./multi-step-form"
import { useState } from "react"

interface QuoteSummaryStepProps { 
  formData: QuoteFormData 
  onSubmit: () => void 
  onPrev: () => void 
  isSubmitting: boolean 
}

// Helper functions to display readable text
export function QuoteSummaryStep({ formData, onSubmit, onPrev, isSubmitting }: QuoteSummaryStepProps) {


  
  // Helper functions to display readable text
  const getCleaningTypeDisplay = (type: string) => {
    switch (type) {
      case "standard":
        return "Standard Cleaning"
      case "deep":
        return "Deep Cleaning"
      case "post_construction":
        return "Post-Construction Cleaning"
      default:
        return type
    }
  }

  // Property type display
  const getPropertyTypeDisplay = (type: string) => {
    return type === "home" ? "🏠 Home" : "🏢 Office"
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">Review Your Quote Request</h3>
        <p className="text-muted-foreground">Please review the information below before submitting</p>
      </div>

      {/* Property Details Summary */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg text-primary flex items-center gap-2">🏠 Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Property Type</p>
              <p className="font-semibold">{getPropertyTypeDisplay(formData.propertyType)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cleaning Type</p>
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {getCleaningTypeDisplay(formData.cleaningType)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Rooms</p>
              <p className="font-semibold">{formData.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bathrooms</p>
              <p className="font-semibold">{formData.bathrooms}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Square Footage</p>
              <p className="font-semibold">{formData.squareFootage || "Not specified"}</p>
            </div>
          </div>

          {formData.desiredDate1 && (
            <div>
              <p className="text-sm text-muted-foreground">Preferred Date</p>
              <p className="font-semibold">
                {new Date(
                  Array.isArray(formData.desiredDate1)
                    ? formData.desiredDate1[0]
                    : formData.desiredDate1
                ).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Details Summary */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg text-primary flex items-center gap-2">👤 Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-semibold">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-semibold">{formData.phone}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-semibold">{formData.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Service Address</p>
            <p className="font-semibold">{formData.state}</p>
          </div>

          {formData.specialInstructions && (
            <div>
              <p className="text-sm text-muted-foreground">Special Instructions</p>
              <p className="font-semibold text-sm bg-muted p-3 rounded-md">{formData.specialInstructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Terms and Submit */}
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            By submitting this request, you agree to receive a personalized quote via email. Our team will review your
            requirements and respond within 24 hours with a detailed quote.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isSubmitting}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            Back to Contact Details
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
          >
            {isSubmitting ? "Submitting..." : "Submit Quote Request"}
          </Button>
        </div>
      </div>
    </div>
  )
}
