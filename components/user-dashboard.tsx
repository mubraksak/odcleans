"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QuoteCard } from "./quote-card"
import Link from "next/link"

interface Quote {
  id: number
  propertyType: string
  bedrooms: number
  bathrooms: number
  cleaningType: string
  status: string
  proposedPrice?: number
  desired_date: string
  specialInstructions?: string
  created_at: string
  bookingId?: number
  scheduledDate?: string
  bookingStatus?: string
  adminNote: string
  cleaning_type: string 
  square_footage: string
  cleaning_frequency: string
  has_pets: string
  base_price: string

}

export function UserDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/user/quotes")
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes)
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  const activeQuotes = quotes.filter((q) => q.status === "quoted")
  const pendingQuotes = quotes.filter((q) => q.status === "pending")
  const completedQuotes = quotes.filter((q) => ["accepted", "declined", "completed"].includes(q.status))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-accent-foreground font-bold text-lg">O</span>
          </div>
          <p className="text-muted-foreground">Loading your quotes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="font-serif font-bold text-3xl text-primary mb-2">Your Dashboard</h1>
        <p className="text-muted-foreground">Manage your cleaning service quotes and bookings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Being reviewed by our team</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{quotes.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Quotes */}
      {activeQuotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl text-primary">Active Quotes</h2>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {activeQuotes.length} awaiting response
            </Badge>
          </div>
          <div className="grid gap-6">
            {activeQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onUpdate={fetchQuotes} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Quotes */}
      {pendingQuotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-primary">Pending Review</h2>
          <div className="grid gap-6">
            {pendingQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onUpdate={fetchQuotes} />
            ))}
          </div>
        </div>
      )}

      {/* Quote History */}
      {completedQuotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-primary">Quote History</h2>
          <div className="grid gap-6">
            {completedQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onUpdate={fetchQuotes} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {quotes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <CardTitle className="text-xl text-primary mb-2">No quotes yet</CardTitle>
            <CardDescription className="mb-6">
              Get started by requesting your first cleaning service quote
            </CardDescription>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/quote">Request a Quote</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
