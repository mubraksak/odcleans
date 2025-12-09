"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Create a separate component that uses useSearchParams
function CleanerLoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  // Check if already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const response = await fetch("/api/cleaner/check-session")
        if (response.ok) {
          router.push("/cleaner/dashboard")
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    }
    
    checkExistingSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("🔄 Attempting login...")
      const response = await fetch("/api/cleaner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        console.log("✅ Login successful, redirecting...")
        router.push("/cleaner/dashboard")
        router.refresh()
      } else {
        console.log("❌ Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("💥 Login error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cleaner Login</CardTitle>
            <CardDescription>
              Access your cleaning partner dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Don't have an account? </p>
                <Link 
                  href="/cleaner/register" 
                  className="text-accent hover:underline"
                >
                  Apply to become a cleaner
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main page component wrapped in Suspense
export default function CleanerLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Loading...</CardTitle>
              <CardDescription>
                Please wait while we load the login page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-muted-foreground">Loading login form...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CleanerLoginContent />
    </Suspense>
  )
}