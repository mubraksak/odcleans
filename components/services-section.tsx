"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Service } from "@/lib/types"

interface ServicesSectionProps {
  services: Service[]
}

const serviceIcons = {
  "Standard Cleaning": "🏠",
  "Deep Cleaning": "✨",
  "Post-Construction Cleaning": "🔨",
  "Office Cleaning": "🏢",
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-accent/20">
            Our Services
          </Badge>
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-primary mb-4">
            Professional Cleaning Solutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From regular maintenance to deep cleaning, we provide comprehensive services tailored to your specific
            needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/30"
            >
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {serviceIcons[service.name as keyof typeof serviceIcons] || "🧽"}
                </div>
                <CardTitle className="text-xl font-serif text-primary group-hover:text-accent transition-colors">
                  {service.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Need a custom cleaning solution?</p>
          <Badge
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
          >
            Contact us for a personalized quote
          </Badge>
        </div>
      </div>
    </section>
  )
}
