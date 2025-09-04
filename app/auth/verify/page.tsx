"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("No verification token provided")
      return
    }

    // The verification happens on the server via the API route
    // This page is just for user feedback
    const verify = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`)
        if (response.ok) {
          setStatus("success")
          setMessage("Successfully signed in! Redirecting to your dashboard...")
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 2000)
        } else {
          setStatus("error")
          setMessage("Invalid or expired verification link")
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred during verification")
      }
    }

    verify()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif text-primary">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Welcome Back!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mx-auto animate-pulse">
              <span className="text-accent-foreground font-bold text-lg">O</span>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-accent text-xl">✓</span>
              </div>
              <p className="text-sm text-muted-foreground">You will be redirected automatically...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-destructive text-xl">✗</span>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/login">Try Again</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/">Go Home</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
