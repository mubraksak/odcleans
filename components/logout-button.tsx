// components/admin/logout-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent
      })

      if (response.ok) {
        // Redirect to login page
        router.push('/admin/login')
        // Refresh to clear any client-side state
        router.refresh()
      } else {
        console.error('Logout failed')
        alert('Logout failed. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Logout error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="bg-transparent border-border hover:bg-accent hover:text-accent-foreground"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  )
}