// middleware.ts (root level)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('🛣️ Middleware - Path:', request.nextUrl.pathname)
  
  // Log redirects
  if (request.nextUrl.pathname.startsWith('/cleaner')) {
    console.log('🔍 Cleaner route accessed')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/cleaner/:path*',
}