import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MultiStepForm } from "@/components/multi-step-form"

export default function QuotePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-primary mb-4">
              Get Your Free Cleaning Quote
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us about your cleaning needs and we'll provide you with a personalized quote within 24 hours. No
              obligation, completely free.
            </p>
          </div>

          {/* Multi-Step Form */}
          <MultiStepForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
