"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Receipt {
  id: number
  quote_id: number
  customer_name: string
  cleaning_type: string
  property_type: string
  scheduled_date: string
  payment_amount: number
  payment_date: string
  payment_status: string
  business_name: string
}

export function CleanerReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingReceipt, setSendingReceipt] = useState<number | null>(null)

  const fetchReceipts = async () => {
    try {
      const response = await fetch("/api/cleaner/receipts")
      if (response.ok) {
        const data = await response.json()
        setReceipts(data.receipts)
      }
    } catch (error) {
      console.error("Error fetching receipts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
  }, [])

  const handleSendReceipt = async (assignmentId: number) => {
    setSendingReceipt(assignmentId)
    try {
      const response = await fetch("/api/cleaner/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment_id: assignmentId })
      })

      if (response.ok) {
        alert("Receipt sent successfully to your email!")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to send receipt")
      }
    } catch (error) {
      console.error("Error sending receipt:", error)
      alert("Failed to send receipt")
    } finally {
      setSendingReceipt(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-accent-foreground font-bold text-lg">O</span>
          </div>
          <p className="text-muted-foreground">Loading receipts...</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Receipts</CardTitle>
        <CardDescription>Your payment history and receipts</CardDescription>
      </CardHeader>
      <CardContent>
        {receipts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Details</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {receipt.cleaning_type} - {receipt.property_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quote #{receipt.quote_id.toString().padStart(6, "0")}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{receipt.customer_name}</p>
                  </TableCell>
                  <TableCell>
                    {receipt.scheduled_date 
                      ? new Date(receipt.scheduled_date).toLocaleDateString()
                      : "Not scheduled"
                    }
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${receipt.payment_amount}
                  </TableCell>
                  <TableCell>
                    {receipt.payment_date 
                      ? new Date(receipt.payment_date).toLocaleDateString()
                      : "Pending"
                    }
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      receipt.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {receipt.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendReceipt(receipt.id)}
                      disabled={sendingReceipt === receipt.id}
                    >
                      {sendingReceipt === receipt.id ? "Sending..." : "Get Receipt"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧾</span>
            </div>
            <CardTitle className="text-xl text-primary mb-2">No receipts yet</CardTitle>
            <CardDescription>
              Your payment receipts will appear here once you complete jobs and get paid.
            </CardDescription>
          </div>
        )}
      </CardContent>
    </Card>
  )
}