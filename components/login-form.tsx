"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Magic link sent to your email! Check your inbox and click the link to sign in.")
        // For development - show the magic link
        if (data.magicLink) {
          console.log("Magic link (dev only):", data.magicLink)
        }
      } else {
        setError(data.error || "Failed to send magic link")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif text-primary">Sign In</CardTitle>
        <CardDescription>Enter your email to receive a magic link for secure access to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {message && (
            <Alert className="border-accent/20 bg-accent/5">
              <AlertDescription className="text-accent">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Magic Link"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Don't have an account?</p>
          <p className="mt-1">
            <a href="/quote" className="text-accent hover:text-accent/80 font-medium">
              Request a quote
            </a>{" "}
            to get started
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
