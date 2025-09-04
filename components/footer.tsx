"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">O</span>
              </div>
              <span className="font-serif font-bold text-xl">Od Cleaning Services</span>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Professional cleaning services for homes and offices. We're committed to providing exceptional service
              with attention to detail and customer satisfaction.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                <span className="text-sm">📧</span>
              </div>
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                <span className="text-sm">📱</span>
              </div>
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                <span className="text-sm">🌐</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Standard Cleaning
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Deep Cleaning
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Office Cleaning
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-accent transition-colors">
                  Post-Construction
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>📞 (555) 123-4567</li>
              <li>📧 info@odcleaning.com</li>
              <li>📍 Your City, State</li>
              <li>
                <Link href="/quote" className="text-accent hover:text-accent/80 transition-colors">
                  Get a Quote
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">© 2024 Od Cleaning Services. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-primary-foreground/60">
            <Link href="#" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
