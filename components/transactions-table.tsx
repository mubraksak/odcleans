"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Download, Eye, Search, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Transaction {
  id: number
  quote_id: number
  stripe_payment_intent_id: string
  amount: number
  currency: string
  status: string
  customer_email: string
  customer_name: string
  created_at: string
  failure_message?: string
  quote?: {
    property_type: string
    cleaning_type: string
    bedrooms: number
    bathrooms: number
    square_footage?: number
  }
}

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/admin/transactions?status=${statusFilter}&search=${searchQuery}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [statusFilter, searchQuery])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded": return "bg-green-100 text-green-800 border-green-200"
      case "failed": return "bg-red-100 text-red-800 border-red-200"
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "refunded": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadInvoice = async (transaction: Transaction) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transaction.id}/invoice`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `invoice-${transaction.quote_id}-${transaction.stripe_payment_intent_id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        console.error("Failed to generate invoice")
      }
    } catch (error) {
      console.error("Error downloading invoice:", error)
    }
  }

  const viewInvoice = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setInvoiceModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-accent-foreground font-bold text-lg">$</span>
          </div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Filters</CardTitle>
          <CardDescription>Filter and search through payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.stripe_payment_intent_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      #{transaction.quote_id.toString().padStart(6, "0")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${transaction.amount}
                        <span className="text-sm text-muted-foreground ml-1">{transaction.currency.toUpperCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewInvoice(transaction)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(transaction)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your filters or search query"
                  : "Transactions will appear here once payments are processed"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Transaction #{selectedTransaction?.stripe_payment_intent_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
                  <p className="text-muted-foreground">OdClean Professional Cleaning Services</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">Quote #{selectedTransaction.quote_id.toString().padStart(6, "0")}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedTransaction.created_at)}
                  </p>
                </div>
              </div>

              {/* Customer and Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="font-medium">{selectedTransaction.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedTransaction.customer_email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Payment Details</h3>
                  <div className="bg-muted p-3 rounded-md space-y-1">
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-sm">{selectedTransaction.stripe_payment_intent_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedTransaction.status)}>
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold">
                        ${selectedTransaction.amount} {selectedTransaction.currency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              {selectedTransaction.quote && (
                <div>
                  <h3 className="font-semibold mb-2">Service Details</h3>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span>Property Type:</span>
                      <span className="capitalize">{selectedTransaction.quote.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cleaning Type:</span>
                      <span className="capitalize">{selectedTransaction.quote.cleaning_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bedrooms/Bathrooms:</span>
                      <span>{selectedTransaction.quote.bedrooms} beds, {selectedTransaction.quote.bathrooms} baths</span>
                    </div>
                    {selectedTransaction.quote.square_footage && (
                      <div className="flex justify-between">
                        <span>Square Footage:</span>
                        <span>{selectedTransaction.quote.square_footage} sq ft</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Amount Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-2xl text-accent">
                    ${selectedTransaction.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-center text-sm text-muted-foreground">
                <p>Thank you for choosing OdClean Professional Cleaning Services</p>
                <p>support@odclean.com | (555) 123-4567</p>
                <p className="mt-2">This is an automated invoice. No signature required.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => downloadInvoice(selectedTransaction)}
                  className="flex-1 bg-accent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}