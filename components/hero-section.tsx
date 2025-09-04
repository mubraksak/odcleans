"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroSectionProps {
  title: string
  subtitle: string
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/clean-modern-office.png')] bg-primary bg-cover bg-center opacity-50" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-serif font-bold text-4xl md:text-6xl lg:text-7xl text-primary mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg font-semibold"
          >
            <Link href="/quote">Get a Free Quote</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg bg-transparent"
          >
            <Link href="#services">Our Services</Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span>Licensed & Insured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span>100% Satisfaction Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span>Eco-Friendly Products</span>
          </div>
        </div>
      </div>
    </section>
  )
}
