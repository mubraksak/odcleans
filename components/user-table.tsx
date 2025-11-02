"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Client {
  id: number
  name: string
  email: string
  phone: string
  address?: string
  created_at: string
  total_quotes: number
  accepted_quotes: number
  total_spent: number
  last_quote_date?: string
}

interface ClientsTableProps {
  initialClients?: Client[]
}

export function ClientsTable({ initialClients = [] }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })

  const fetchClients = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/clients?${params}`)
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
        setPagination(data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 1
        })
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchClients(1, value)
    }, 500)
    return () => clearTimeout(timeoutId)
  }

  const handlePageChange = (newPage: number) => {
    fetchClients(newPage, search)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return "Invalid date"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getCustomerStatus = (totalQuotes: number, lastQuoteDate?: string) => {
    if (totalQuotes === 0) return "New"
    
    if (!lastQuoteDate) return "Active"
    
    try {
      const lastQuote = new Date(lastQuoteDate)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      if (lastQuote > thirtyDaysAgo) return "Active"
      return "Inactive"
    } catch {
      return "Active"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200"
      case "New": return "bg-blue-100 text-blue-800 border-blue-200"
      case "Inactive": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getLoyaltyLevel = (acceptedQuotes: number, totalSpent: number) => {
    if (acceptedQuotes >= 5 || totalSpent >= 1000) return "VIP"
    if (acceptedQuotes >= 2 || totalSpent >= 300) return "Regular"
    return "New"
  }

  const getLoyaltyColor = (level: string) => {
    switch (level) {
      case "VIP": return "bg-purple-100 text-purple-800 border-purple-200"
      case "Regular": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading && clients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-primary">Clients</CardTitle>
              <CardDescription>Manage your customer database</CardDescription>
            </div>
            <div className="w-80">
              <Input
                placeholder="Search clients by name, email, or phone..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Loyalty</TableHead>
                  <TableHead>Quotes</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const status = getCustomerStatus(client.total_quotes, client.last_quote_date)
                  const loyaltyLevel = getLoyaltyLevel(client.accepted_quotes, client.total_spent)
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name || "Unnamed Client"}</p>
                          {client.address && (
                            <p className="text-sm text-muted-foreground">{client.address}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.email}</p>
                          {client.phone && (
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLoyaltyColor(loyaltyLevel)}>
                          {loyaltyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-semibold">{client.total_quotes}</span>
                          <p className="text-xs text-muted-foreground">
                            ({client.accepted_quotes} accepted)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-semibold">{formatCurrency(client.total_spent)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.last_quote_date ? (
                          <div>
                            <p className="text-sm">{formatDate(client.last_quote_date)}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.total_quotes === 1 ? "First quote" : "Last quote"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No activity</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {clients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {search ? "No clients found matching your search" : "No clients found"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} clients
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Details Modal */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="font-medium">{selectedClient.name || "Not provided"}</p>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <p className="font-medium">{selectedClient.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <p className="font-medium">{selectedClient.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label>Customer Status</Label>
                  <Badge className={getStatusColor(getCustomerStatus(selectedClient.total_quotes, selectedClient.last_quote_date))}>
                    {getCustomerStatus(selectedClient.total_quotes, selectedClient.last_quote_date)}
                  </Badge>
                </div>
              </div>

              {selectedClient.address && (
                <div>
                  <Label>Address</Label>
                  <p className="font-medium">{selectedClient.address}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Quotes</Label>
                  <p className="font-medium text-2xl">{selectedClient.total_quotes}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.accepted_quotes} accepted
                  </p>
                </div>
                <div>
                  <Label>Total Spent</Label>
                  <p className="font-medium text-2xl text-green-600">
                    {formatCurrency(selectedClient.total_spent)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loyalty Level</Label>
                  <Badge className={getLoyaltyColor(getLoyaltyLevel(selectedClient.accepted_quotes, selectedClient.total_spent))}>
                    {getLoyaltyLevel(selectedClient.accepted_quotes, selectedClient.total_spent)}
                  </Badge>
                </div>
                <div>
                  <Label>Last Quote Date</Label>
                  <p className="font-medium">
                    {selectedClient.last_quote_date ? formatDate(selectedClient.last_quote_date) : "No quotes yet"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Member Since</Label>
                  <p className="font-medium">{formatDate(selectedClient.created_at)}</p>
                </div>
                <div>
                  <Label>Client ID</Label>
                  <p className="font-mono font-medium">#{selectedClient.id.toString().padStart(6, "0")}</p>
                </div>
              </div>

              {/* <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  View Quotes
                </Button>
                <Button className="flex-1">
                  Contact Client
                </Button>
              </div> */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}