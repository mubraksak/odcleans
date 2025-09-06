// Database entity types
export interface SiteConfig {
  hero_title: string
  hero_subtitle: string
  id?: number
  companyName?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  metaDescription?: string
  metaKeywords?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Service {
  id?: number
  name: string
  description: string
  icon?: string
  image_url?: string
  priceRange?: string
  duration?: string
  isActive: boolean
  displayOrder: number
  createdAt?: Date
  updatedAt?: Date
}

export interface Testimonial {
  id?: number
  clientName: string
  image_url?: string
  rating: number
  quote: string
  serviceType?: string
  isActive: boolean
  displayOrder: number
  createdAt?: Date
  updatedAt?: Date
}

// API Response types
export interface SiteConfigResponse {
  siteConfig: SiteConfig
  services: Service[]
  testimonials: Testimonial[]
}

// Database query types
export interface QueryResult {
  insertId?: number
  affectedRows?: number
  length: number
  [key: string]: any
}

// Form data types
export interface ContactFormData {
  name: string
  email: string
  phone: string
  service: string
  message: string
}

export interface QuoteRequestFormData {
  name: string
  email: string
  phone: string
  serviceType: string
  propertySize: string
  frequency: string
  specialRequests?: string
  address: string
  preferredDate?: string
  preferredTime?: string
}

// Booking and Quote types
export interface Booking {
  id?: number
  quoteRequestId: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  scheduledDate?: Date
  assignedStaff?: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface QuoteRequest {
  id?: number
  name: string
  email: string
  phone: string
  serviceType: string
  propertySize: string
  frequency: string
  specialRequests?: string
  address: string
  preferredDate?: string
  preferredTime?: string
  status: 'pending' | 'accepted' | 'rejected'
  estimatedPrice?: number
  createdAt?: Date
  updatedAt?: Date
}

// Admin types
export interface AdminStats {
  totalBookings: number
  pendingQuotes: number
  completedServices: number
  revenue: number
}