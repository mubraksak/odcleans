"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"
import { cn } from "@/lib/utils"

// const navigation = [
//   {
//     name: "Dashboard",
//     href: "/admin",
//     icon: "📊",
//   },
//   {
//     name: "Quotes",
//     href: "/admin/quotes",
//     icon: "📋",
//   },
//   {
//     name: "Clients",
//     href: "/admin/clients",
//     icon: "👥",
//   },
//   {
//     name: "Schedule",
//     href: "/admin/schedule",
//     icon: "📅",
//   },
  
//   // Add this to your navigation items
//   {
//     name: "Transactions",
//     href: "/admin/transactions",
//     icon: "💳",
//   },
//   {
//       href: "/admin/cleaner",
//       name: "Cleaners",
//       icon: "👥"
//     },
//     {
//       href: "/admin/assignments", 
//       name: "Assignments",
//       icon: "📋"
//     },
//     {
//       name: "Service-managemet",
//       href: "/admin/service-management",
//       icon: "⚙️",
//     },
//     {
//       name: "Aditional Services",
//       href: "/admin/aditional-services",
//       icon: "🧼",
//     },
//     {
//       name: "CMS",
//       href: "/admin/cms",
//       icon: "✏️",
//     },
//   ]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  // const isScrollable = navigation.length * 48 > window.innerHeight - 200 // Approximate item height and header/footer space



   useEffect(() => {
    const checkScrollable = () => {
      if (typeof window !== 'undefined') {
        const navigationLength = navigation.length
        const itemHeight = 48 // Approximate height per item
        const availableHeight = window.innerHeight - 200 // Account for header/footer
        setIsScrollable(navigationLength * itemHeight > availableHeight)
      }
    }

    checkScrollable()


    // Add resize listener
    window.addEventListener('resize', checkScrollable)
    return () => window.removeEventListener('resize', checkScrollable)
  }, [])

  const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    name: "Quotes",
    href: "/admin/quotes",
    icon: "📋",
  },
  {
    name: "Clients",
    href: "/admin/clients",
    icon: "👥",
  },
  {
    name: "Schedule",
    href: "/admin/schedule",
    icon: "📅",
  },
  
  // Add this to your navigation items
  {
    name: "Transactions",
    href: "/admin/transactions",
    icon: "💳",
  },
  {
      href: "/admin/cleaner",
      name: "Cleaners",
      icon: "👥"
    },
    {
      href: "/admin/assignments", 
      name: "Assignments",
      icon: "📋"
    },
    {
      name: "Service-managemet",
      href: "/admin/service-management",
      icon: "⚙️",
    },
    {
      name: "Aditional Services",
      href: "/admin/aditional-services",
      icon: "🧼",
    },
    {
      name: "CMS",
      href: "/admin/cms",
      icon: "✏️",
    },
  ]

  return (
    <div className={cn("bg-primary text-primary-foreground transition-all duration-300", isCollapsed ? "w-16" : "w-64", isScrollable ? "overflow-y-auto" : "overflow-y-hidden")}>
      <div className="flex h-full flex-col justify-between max-h-screen"> 
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-foreground/20">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">O</span>
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg">Od Cleaning</h2>
                <p className="text-xs text-primary-foreground/70">Admin Panel</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            {isCollapsed ? "→" : "←"}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-primary-foreground/20">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-primary-foreground/70">Administrator</p>
              </div>

              <div className="flex-1 min-w-0">
                 <LogoutButton />
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
