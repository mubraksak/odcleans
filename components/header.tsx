"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<"customer" | "cleaner" | "admin" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if user is logged in as customer
      const customerResponse = await fetch("/api/auth/session")
      if (customerResponse.ok) {
        const customerData = await customerResponse.json()
        if (customerData.user) {
          setIsLoggedIn(true)
          setUserRole("customer")
          setIsLoading(false)
          return
        }
      }

      // Check if user is logged in as cleaner
      const cleanerResponse = await fetch("/api/cleaner/check-session")
      if (cleanerResponse.ok) {
        const cleanerData = await cleanerResponse.json()
        if (cleanerData.authenticated) {
          setIsLoggedIn(true)
          setUserRole("cleaner")
          setIsLoading(false)
          return
        }
      }

      // Check if user is logged in as admin
      const adminSession = document.cookie.includes('admin_session')
      if (adminSession) {
        setIsLoggedIn(true)
        setUserRole("admin")
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      if (userRole === "customer") {
        await fetch("/api/auth/logout", { method: "POST" })
      } else if (userRole === "cleaner") {
        await fetch("/api/cleaner/logout", { method: "POST" })
      } else if (userRole === "admin") {
        await fetch("/api/admin/logout", { method: "POST" })
      }
      
      // Clear local state and redirect
      setIsLoggedIn(false)
      setUserRole(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Error during sign out:", error)
      // Still redirect even if API call fails
      window.location.href = "/"
    }
  }

  const getDashboardLink = () => {
    switch (userRole) {
      case "customer":
        return "/dashboard"
      case "cleaner":
        return "/cleaner/dashboard"
      case "admin":
        return "/admin"
      default:
        return "/"
    }
  }

  const getUserDisplayText = () => {
    switch (userRole) {
      case "customer":
        return "Dashboard"
      case "cleaner":
        return "Cleaner Dashboard"
      case "admin":
        return "Admin Panel"
      default:
        return "Dashboard"
    }
  }

  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <img src="/logo.png" width="100px" height="150px" alt="OD Cleaning Services Logo" />
              </div>
              <span className="font-serif font-bold text-xl text-primary">OD Cleaning Services</span>
            </Link>
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <img src="/logo.png" width="100px" height="150px" alt="OD Cleaning Services Logo" />
            </div>
            <span className="font-serif font-bold text-xl text-primary">OD Cleaning Services</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#services" className="text-muted-foreground hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
              Reviews
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Button asChild variant="ghost" className="text-primary hover:text-accent">
                  <Link href={getDashboardLink()}>
                    {getUserDisplayText()}
                  </Link>
                </Button>

                 <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/quote">Get Quote</Link>
                </Button>

                <Button 
                  variant="outline" 
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-primary hover:text-accent">
                  <Link href="/login">Sign In</Link>
                </Button>

                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/quote">Get Quote</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
              <div className={`h-0.5 bg-primary transition-all ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <div className={`h-0.5 bg-primary transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
              <div className={`h-0.5 bg-primary transition-all ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link 
                href="#services" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="#testimonials" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link 
                href="#contact" 
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isLoggedIn ? (
                  <>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href={getDashboardLink()} onClick={() => setIsMenuOpen(false)}>
                        {getUserDisplayText()}
                      </Link>
                    </Button>

                    <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground justify-start">
                      <Link href="/quote" onClick={() => setIsMenuOpen(false)}>Get Quote</Link>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground justify-start"
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground justify-start">
                      <Link href="/quote" onClick={() => setIsMenuOpen(false)}>Get Quote</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}