"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"
import type { SiteConfig, Service, Testimonial } from "@/lib/types"

interface LandingData {
  siteConfig: SiteConfig
  services: Service[]
  testimonials: Testimonial[]
}

export default function HomePage() {
  const [data, setData] = useState<LandingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLandingData() {
      try {
        const response = await fetch("/api/site-config")
        if (response.ok) {
          const landingData = await response.json()
          setData(landingData)
        }
      } catch (error) {
        console.error("Error fetching landing data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLandingData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-accent-foreground font-bold text-lg">O</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Fallback data if API fails
  const fallbackData: LandingData = {
    siteConfig: {
      id: 1,
      hero_title: "Premium Cleaning Services for Your Home & Office",
      hero_subtitle:
        "Experience the difference with Od Cleaning Services. Professional, reliable, and thorough cleaning solutions tailored to your needs.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    services: [
      {
        id: 1,
        name: "Standard Cleaning",
        description: "Regular maintenance cleaning including dusting, vacuuming, mopping, and bathroom sanitization.",
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Deep Cleaning",
        description:
          "Comprehensive cleaning service covering every corner, perfect for seasonal cleaning or move-in preparation.",
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Post-Construction Cleaning",
        description:
          "Specialized cleaning for newly constructed or renovated spaces, removing dust, debris, and construction residue.",
        displayOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "Office Cleaning",
        description: "Professional commercial cleaning services to maintain a clean and productive work environment.",
        displayOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    testimonials: [
      {
        id: 1,
        client_name: "Sarah Johnson",
        quote: "Od Cleaning Services transformed my home! Their attention to detail is incredible and the team is so professional.",
        displayOrder: 1,
         image_url: "https://media.istockphoto.com/id/1406197730/photo/portrait-of-a-young-handsome-indian-man.jpg?s=1024x1024&w=is&k=20&c=VruKKTu4jBF2xPEEQUMWwd4bwJPysSsqLuZ7h1OyD8M=",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 0
      },
      {
        id: 2,
        client_name: "Michael Chen",
        quote: "Best cleaning service in the city. They consistently deliver exceptional results for our office space.",
        displayOrder: 2,
         image_url: "https://media.istockphoto.com/id/1406197730/photo/portrait-of-a-young-handsome-indian-man.jpg?s=1024x1024&w=is&k=20&c=VruKKTu4jBF2xPEEQUMWwd4bwJPysSsqLuZ7h1OyD8M=",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 0
      },
      {
        id: 3,
        client_name: "Emily Rodriguez",
        quote: "I trust Od Cleaning with my home completely. They are reliable, thorough, and always exceed expectations.",
        displayOrder: 3,
        image_url: "https://media.istockphoto.com/id/1406197730/photo/portrait-of-a-young-handsome-indian-man.jpg?s=1024x1024&w=is&k=20&c=VruKKTu4jBF2xPEEQUMWwd4bwJPysSsqLuZ7h1OyD8M=",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: 0
      },
    ],
  }

  const displayData = data || fallbackData

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection title={displayData.siteConfig.hero_title} subtitle={displayData.siteConfig.hero_subtitle} />
        <ServicesSection services={displayData.services} />
        <div id="testimonials">
          <TestimonialsSection testimonials={displayData.testimonials} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
