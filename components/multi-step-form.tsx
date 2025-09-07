"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PropertyDetailsStep } from "./property-details-step"
import { ContactDetailsStep } from "./contact-details-step"
import { AdditionalServicesStep } from "./additional-service-step"
import { QuoteSummaryStep } from "./quote-summary-step"
import { SuccessStep } from "./success-step"

export interface QuoteFormData {

  // Step 1: Property Details
  /* NEW DATA */
  serviceType: string
  propertyType: string
  squareFootage: number
  bedrooms: number
  bathrooms: number
  cleaningType: string
  cleaningFrequency: string
  hasPets: string
  desiredDate1: string | number | readonly string[] | undefined
  desiredDate2: string | number | readonly string[] | undefined
  desiredDate3: string | number | readonly string[] | undefined


  // Additional Services
  laundry: boolean
  foldingClothes: boolean
  fridgeCleaning: boolean
  baseboardCleaning: boolean
  cabinetCleaning: boolean
  windowCleaning: boolean
  additionalDetails: string




  // Contact Details
  name: string
  email: string
  phone: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  specialInstructions: string
}

const initialFormData: QuoteFormData = {
  // Step 1: Property Details
  serviceType: "",
  propertyType: "",
  bedrooms: 1,
  bathrooms: 1,
  squareFootage: 0,
  cleaningType: "",
  cleaningFrequency: "",
  hasPets: "",
  desiredDate1: "",
  desiredDate2: "",
  desiredDate3: "",

 // Additional Services
  laundry: false,
  foldingClothes: false,
  fridgeCleaning: false,
  baseboardCleaning: false,
  cabinetCleaning: false,
  windowCleaning: false,
  additionalDetails: "",

  // Contact Details
  name: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  specialInstructions: "",

}

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quoteId, setQuoteId] = useState<number | null>(null)

  const totalSteps = 5

  const updateFormData = (updates: Partial<QuoteFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const submitQuote = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        setQuoteId(result.quoteId)
        nextStep()
      } else {
        throw new Error("Failed to submit quote")
      }
    } catch (error) {
      console.error("Error submitting quote:", error)
      alert("There was an error submitting your quote. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Property Details"
      case 2:
        return "Additonal Service"
      case 3:
        return "Contact Information"
      case 4:
        return "Review & Submit"
      case 5:
        return "Quote Submitted"
      default:
        return ""
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step <= currentStep ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div className={`w-16 h-0.5 mx-2 transition-colors ${step < currentStep ? "bg-accent" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
            Step {currentStep} of {totalSteps}
          </Badge>
          <h2 className="font-serif font-bold text-2xl text-primary mt-2">{getStepTitle(currentStep)}</h2>
        </div>
      </div>

      {/* Form Steps */}
      <Card className="border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-primary">Get Your Free Quote</CardTitle>
          <CardDescription>Tell us about your cleaning needs and we'll provide a personalized quote</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <PropertyDetailsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />
          )}

          {currentStep === 2 && (
            <AdditionalServicesStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}



          {currentStep === 3 && (
            <ContactDetailsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {currentStep === 4 && (
            <QuoteSummaryStep
              formData={formData}
              onSubmit={submitQuote}
              onPrev={prevStep}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 5 && <SuccessStep quoteId={quoteId} />}
        </CardContent>
      </Card>
    </div>
  )
}
