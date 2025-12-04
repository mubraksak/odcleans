// components/cleaner-header.tsx
"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

interface CleanerHeaderProps {
  cleanerData: {
    business_name?: string
    name: string
  }
}

export function CleanerHeader({ cleanerData }: CleanerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
           <img src="/logo.png" width="50px" height="75px" alt="OD Cleaning Services Logo" />
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-xl">OD Cleaning Services</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {cleanerData.business_name || cleanerData.name}
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="font-serif font-bold text-lg">OD Cleaning Services</h1>
              <p className="text-xs text-muted-foreground">
                {cleanerData.business_name || cleanerData.name}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="/cleaner/dashboard" 
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="/cleaner/receipts" 
              className="text-sm font-medium hover:text-accent transition-colors"
            >
              Receipts
            </a>

            <a href="/cleaner/profile" className="text-sm font-medium hover:text-accent">
              Profile
            </a>
            <form action="/api/cleaner/logout" method="POST">
              <button 
                type="submit" 
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                Logout
              </button>
            </form>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4 animate-in slide-in-from-top">
            <div className="flex flex-col space-y-4">
              <a 
                href="/cleaner/dashboard" 
                className="text-sm font-medium hover:text-accent transition-colors py-2 px-3 rounded-lg hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </a>
              <a 
                href="/cleaner/receipts" 
                className="text-sm font-medium hover:text-accent transition-colors py-2 px-3 rounded-lg hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Receipts
              </a>
              <form action="/api/cleaner/logout" method="POST" className="w-full">
                <button 
                  type="submit" 
                  className="w-full text-left text-sm font-medium hover:text-accent transition-colors py-2 px-3 rounded-lg hover:bg-muted/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}