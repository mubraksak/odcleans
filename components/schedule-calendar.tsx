"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CalendarEvent {
  id: number
  title: string
  start: string
  end: string
  backgroundColor: string
  extendedProps: {
    booking: any
    user: any
    quote: any
  }
}

export function ScheduleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("month")

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/schedule")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/schedule/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchEvents()
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error("Error updating booking:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const groupEventsByDate = () => {
    const grouped: { [key: string]: CalendarEvent[] } = {}
    events.forEach((event) => {
      const date = new Date(event.start).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(event)
    })
    return grouped
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading schedule...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const groupedEvents = groupEventsByDate()
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Cleaning Schedule</CardTitle>
              <CardDescription>Manage and track all scheduled cleaning appointments</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Confirmed</span>
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>In Progress</span>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Completed</span>
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Cancelled</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedDates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No scheduled cleanings found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-3">
                  <h3 className="font-semibold text-primary border-b border-border pb-2">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="grid gap-3">
                    {groupedEvents[date].map((event) => (
                      <div
                        key={event.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-primary">{event.title}</h4>
                            <Badge className={getStatusColor(event.extendedProps.booking.status)}>
                              {event.extendedProps.booking.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.start).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {event.extendedProps.user.name} • {event.extendedProps.user.phone}
                          </p>
                          <p>
                            {event.extendedProps.quote.rooms} rooms • ${event.extendedProps.quote.proposed_price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Manage this cleaning appointment</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-primary mb-3">Appointment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date & Time:</span>
                      <p className="font-medium">
                        {new Date(selectedEvent.start).toLocaleString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Service:</span>
                      <p className="font-medium">
                        {selectedEvent.extendedProps.quote.cleaningType.replace("_", " ")} •{" "}
                        {selectedEvent.extendedProps.quote.propertyType}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rooms:</span>
                      <p className="font-medium">{selectedEvent.extendedProps.quote.rooms}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p className="font-medium">${selectedEvent.extendedProps.quote.proposed_price}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-primary mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedEvent.extendedProps.user.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedEvent.extendedProps.user.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{selectedEvent.extendedProps.user.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <p className="font-medium">{selectedEvent.extendedProps.user.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">Update Status</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBookingStatus(selectedEvent.extendedProps.booking.id, "confirmed")}
                    className={
                      selectedEvent.extendedProps.booking.status === "confirmed"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-transparent"
                    }
                  >
                    Confirmed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBookingStatus(selectedEvent.extendedProps.booking.id, "in_progress")}
                    className={
                      selectedEvent.extendedProps.booking.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-transparent"
                    }
                  >
                    In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBookingStatus(selectedEvent.extendedProps.booking.id, "completed")}
                    className={
                      selectedEvent.extendedProps.booking.status === "completed"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-transparent"
                    }
                  >
                    Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBookingStatus(selectedEvent.extendedProps.booking.id, "cancelled")}
                    className={
                      selectedEvent.extendedProps.booking.status === "cancelled"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-transparent"
                    }
                  >
                    Cancelled
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
