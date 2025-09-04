"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import type { Testimonial } from "@/lib/types"

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

type Testimonial = {
  clientName: string; // not string | undefined
  quote : string;
  id : any;
  imageUrl: string;
  // other fields
}
export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-primary mb-4">What Our Clients Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about our services.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-background border-border/50 hover:shadow-md transition-shadow duration-300"
            >
              <CardContent className="p-6">
                {/* Quote */}
                <div className="mb-6">
                  <div className="text-4xl text-accent mb-2 font-serif">"</div>
                  <p className="text-muted-foreground leading-relaxed italic">{testimonial.quote}</p>
                </div>

                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={testimonial.imageUrl || `/placeholder.svg?height=48&width=48&query=professional headshot`}
                      alt={testimonial.clientName}
                    />
                    <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                      {testimonial.clientName
                        // .split(" ")
                        // .map((n) => n[0])
                        // .join("")
                        }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.clientName}</p>
                    <p className="text-sm text-muted-foreground">Verified Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
