"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">O</span>
            </div>
            <span className="font-serif font-bold text-xl text-primary">OD Cleaning Services </span>
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
            <Button asChild variant="ghost" className="text-primary hover:text-accent">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/quote">Get Quote</Link>
            </Button>
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
              <Link href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
                Reviews
              </Link>
              <Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button asChild variant="ghost" className="justify-start">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/quote">Get Quote</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
