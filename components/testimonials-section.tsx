"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

type Testimonial = {
  client_name: string;
  quote: string;
  id: any;
  image_url: string;
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [testimonials.length, isPaused])

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Pause auto-slide on hover
  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  // Safe function to get initials
  const getInitials = (name: string | undefined | null) => {
    if (!name) return "CU"; // Default to "CU" for Customer
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  // Calculate which testimonials to display based on current index
  const getVisibleTestimonials = () => {
    if (testimonials.length <= 3) return testimonials;
    
    const result = [];
    for (let i = -1; i <= 1; i++) {
      let index = (currentIndex + i + testimonials.length) % testimonials.length;
      result.push(testimonials[index]);
    }
    return result;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="py-20 bg-card overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-primary mb-4">What Our Clients Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about our services.
          </p>
        </div>

        {/* Slider Container */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Testimonials Carousel */}
          <div className="flex items-center justify-center gap-6">
            {visibleTestimonials.map((testimonial, index) => {
              const isCenter = index === 1 || testimonials.length <= 3;
              return (
                <div 
                  key={testimonial.id} 
                  className={`flex-shrink-0 transition-all duration-500 ease-in-out ${
                    isCenter ? 'w-full md:w-2/5 scale-100' : 'w-0 md:w-1/5 scale-90 opacity-70'
                  }`}
                >
                  <Card className={`bg-background border-border/50 hover:shadow-md transition-shadow duration-300 h-full ${
                    isCenter ? 'shadow-lg border-accent/30' : ''
                  }`}>
                    <CardContent className="p-6 h-full flex flex-col">
                      {/* Quote */}
                      <div className="mb-6 flex-grow">
                        <div className="text-4xl text-accent mb-2 font-serif">"</div>
                        <p className="text-muted-foreground leading-relaxed italic">{testimonial.quote}</p>
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center gap-4 mt-auto">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={testimonial.image_url || `/placeholder.svg?height=48&width=48`}
                            alt={testimonial.client_name || "Customer"}
                          />
                          <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                            {getInitials(testimonial.client_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-primary">{testimonial.client_name || "Happy Customer"}</p>
                          <p className="text-sm text-muted-foreground">Verified Customer</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Navigation Dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-accent scale-125' : 'bg-border'
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation Arrows */}
          {testimonials.length > 3 && (
            <>
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-accent hover:text-accent-foreground transition-colors duration-300 z-10"
                onClick={() => setCurrentIndex((currentIndex - 1 + testimonials.length) % testimonials.length)}
                aria-label="Previous testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-accent hover:text-accent-foreground transition-colors duration-300 z-10"
                onClick={() => setCurrentIndex((currentIndex + 1) % testimonials.length)}
                aria-label="Next testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}