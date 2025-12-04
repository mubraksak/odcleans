"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

interface ProfileHeaderProps {
  name: string
  email: string
  role: "admin" | "cleaner" | "customer"
  avatarUrl?: string
  businessName?: string
  status: string
  lastLogin?: string
  onAvatarChange?: (file: File) => void
}

export function ProfileHeader({
  name,
  email,
  role,
  avatarUrl,
  businessName,
  status,
  lastLogin,
  onAvatarChange
}: ProfileHeaderProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800"
      case "cleaner": return "bg-blue-100 text-blue-800"
      case "customer": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "approved": return "bg-green-100 text-green-800"
      case "suspended": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onAvatarChange) {
      onAvatarChange(file)
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-gradient-to-r from-background to-muted/20 rounded-xl border">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {name.charAt(0).toUpperCase()}
              {/* {name} */}
            </AvatarFallback>
          </Avatar>
          {onAvatarChange && (
            <>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="avatar-upload">
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full bg-background hover:bg-background/90"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </label>
            </>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{name}</h1>
            <Badge className={getRoleColor(role)}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          </div>
          
          {businessName && (
            <p className="text-lg font-medium text-muted-foreground mb-1">
              {businessName}
            </p>
          )}
          
          <p className="text-muted-foreground mb-2">{email}</p>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            
            {lastLogin && (
              <span className="text-sm text-muted-foreground">
                Last login: {new Date(lastLogin).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}