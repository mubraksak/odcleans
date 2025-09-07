"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Service } from "@/lib/types"
import Image from "next/image"

interface ServicesSectionProps {
  services: Service[]
}

const serviceIcons = {
  "Standard Cleaning": "🏠",
  "Deep Cleaning": "✨",
  "Post-Construction Cleaning": "🔨",
  "Office Cleaning": "🏢",
}

// Fallback icon in case service doesn't have an image
const getFallbackIcon = (serviceName: string) => {
  return serviceIcons[serviceName as keyof typeof serviceIcons] || "🧽"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service) => (
            <Card
              key={service.id}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/30 overflow-hidden bg-white p-0"
            >
              {/* Full-width image at the top - from database */}
              {service.image_url ? (
                <div className="relative w-full h-50  overflow-hidden">
                  <Image
                    src={service.image_url}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {/* Service icon overlay */}
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full p-2">
                    <span className="text-2xl">
                      {getFallbackIcon(service.name)}
                    </span>
                  </div>
                </div>
              ) : (
                // Fallback div with background color and icon if no image
                <div className="relative w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                  <span className="text-6xl opacity-50">
                    {getFallbackIcon(service.name)}
                  </span>
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full p-2">
                    <span className="text-2xl">
                      {getFallbackIcon(service.name)}
                    </span>
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-xl font-serif text-primary group-hover:text-accent transition-colors">
                  {service.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-center text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </CardDescription>
                <div>
                    <ul>
                      <li>Office Cleaning </li>
                      <li>Retail Store Cleaning </li>
                      <li>Medical Facility Cleaning </li>
                      <li>Restaurant Cleaning </li>
                      <li>Warehouse Cleaning </li>
                      <li>Janitorial Services</li>
                      
                    </ul>
                </div>
                
                {/* Additional service details */}
                {(service.priceRange || service.duration) && (
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-4">
                    {service.priceRange && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {service.priceRange}
                      </Badge>
                    )}
                    {service.duration && (
                      <Badge variant="outline" className="border-border">
                        ⏱️ {service.duration}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">Need a custom cleaning solution?</p>
          <Badge
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors px-4 py-2 text-sm"
          >
            Contact us for a personalized quote
          </Badge>
        </div>
      </div>
    </section>
  )
}