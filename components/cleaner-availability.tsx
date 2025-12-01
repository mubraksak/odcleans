"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AvailabilitySlot {
  day_of_week: number
  day_name: string
  start_time: string
  end_time: string
  is_available: boolean
}

const daysOfWeek = [
  { id: 0, name: "Sunday" },
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" }
]

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

export function CleanerAvailability() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/cleaner/availability")
      if (response.ok) {
        const data = await response.json()
        
        // Initialize availability slots
        const initialAvailability: AvailabilitySlot[] = daysOfWeek.flatMap(day => 
          timeSlots.map((time, index) => ({
            day_of_week: day.id,
            day_name: day.name,
            start_time: time,
            end_time: timeSlots[index + 1] || "19:00",
            is_available: data.availability.some((slot: any) => 
              slot.day_of_week === day.id && slot.start_time === time
            )
          }))
        )

        setAvailability(initialAvailability)
      }
    } catch (error) {
      console.error("Error fetching availability:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvailabilityToggle = (day: number, time: string, checked: boolean) => {
    setAvailability(prev => 
      prev.map(slot => 
        slot.day_of_week === day && slot.start_time === time 
          ? { ...slot, is_available: checked }
          : slot
      )
    )
  }

  const handleSaveAvailability = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/cleaner/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          availability: availability.filter(slot => slot.is_available) 
        })
      })

      if (response.ok) {
        alert("Availability updated successfully!")
      } else {
        alert("Failed to update availability")
      }
    } catch (error) {
      console.error("Error saving availability:", error)
      alert("Failed to update availability")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-accent-foreground font-bold text-lg">O</span>
          </div>
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
        <CardDescription>
          Mark the time slots when you're available for cleaning jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {daysOfWeek.map(day => (
            <div key={day.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">{day.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availability
                  .filter(slot => slot.day_of_week === day.id)
                  .map(slot => (
                    <div key={`${day.id}-${slot.start_time}`} className="flex items-center space-x-2">
                      <Checkbox
                        checked={slot.is_available}
                        onCheckedChange={(checked) => 
                          handleAvailabilityToggle(day.id, slot.start_time, checked as boolean)
                        }
                      />
                      <Label className="text-sm">
                        {slot.start_time} - {slot.end_time}
                      </Label>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
          
          <Button onClick={handleSaveAvailability} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}