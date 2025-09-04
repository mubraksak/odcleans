"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface SuccessStepProps {
  quoteId: number | null
}

export function SuccessStep({ quoteId }: SuccessStepProps) {
  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
          <span className="text-accent-foreground text-lg">✓</span>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-bold text-primary">Quote Request Submitted!</h3>
        <p className="text-muted-foreground">
          Thank you! Your request is under review. You will receive a quote via email shortly.
        </p>
      </div>

      {/* Quote ID */}
      {quoteId && (
        <Card className="bg-muted/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Your Quote Request ID</p>
            <p className="font-mono font-bold text-primary text-lg">#{quoteId.toString().padStart(6, "0")}</p>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <div className="space-y-4">
        <div className="bg-card p-6 rounded-lg border border-border/50">
          <h4 className="font-semibold text-primary mb-3">What happens next?</h4>
          <div className="space-y-2 text-sm text-muted-foreground text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-accent text-xs">1</span>
              </div>
              <p>Our team will review your requirements within 24 hours</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-accent text-xs">2</span>
              </div>
              <p>You'll receive a detailed quote via email with pricing and availability</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-accent text-xs">3</span>
              </div>
              <p>Accept the quote and schedule your cleaning service online</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            <Link href="/">Return to Homepage</Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/quote">Request Another Quote</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
