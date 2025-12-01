// components/mobile-cleaner-card.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MobileJobCardProps {
  job: {
    id: number
    quote_id: number
    customer_name: string
    cleaning_type: string
    property_type: string
    scheduled_date: string
    total_price: number
    status: string
    address?: string
    special_instructions?: string
  }
  onAction: (jobId: number, action: string) => void
}

export function MobileJobCard({ job, onAction }: MobileJobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "accepted": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">
              {job.cleaning_type} - {job.property_type}
            </h3>
            <p className="text-sm text-muted-foreground">
              #{job.quote_id.toString().padStart(6, "0")}
            </p>
          </div>
          <Badge className={getStatusColor(job.status)}>
            {job.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{job.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">When:</span>
            <span className="font-medium">
              {new Date(job.scheduled_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Earnings:</span>
            <span className="font-medium text-green-600">${job.total_price * 0.7}</span>
          </div>
          {job.address && (
            <div>
              <span className="text-muted-foreground">Address:</span>
              <p className="font-medium">{job.address}</p>
            </div>
          )}
        </div>

        {job.special_instructions && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
            <p className="text-sm text-yellow-700">{job.special_instructions}</p>
          </div>
        )}

        <div className="flex gap-2">
          {job.status === "pending" && (
            <>
              <Button 
                onClick={() => onAction(job.id, "accept")}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                Accept
              </Button>
              <Button 
                onClick={() => onAction(job.id, "reject")}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Reject
              </Button>
            </>
          )}
          {job.status === "accepted" && (
            <Button 
              onClick={() => onAction(job.id, "complete")}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}