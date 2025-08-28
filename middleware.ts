import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is not using HTTPS and not on localhost
  const isLocalhost = request.nextUrl.hostname === 'localhost' || 
                     request.nextUrl.hostname === '127.0.0.1' ||
                     request.nextUrl.hostname.startsWith('192.168.') ||
                     request.nextUrl.hostname.endsWith('.local');

  // Only enforce HTTPS in production (not on localhost during development)
  if (!isLocalhost && request.nextUrl.protocol === 'http:') {
    // Redirect to HTTPS version
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    
    return NextResponse.redirect(httpsUrl, 301); // 301 = Permanent redirect
  }

  // Add security headers for all requests
  const response = NextResponse.next();
  
  // Force HTTPS in browsers (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  // Apply middleware to all routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
