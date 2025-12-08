import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return new Response('Access Denied', {
    status: 403,
  })
}

export const config = {
  matcher: '/studio/:path*',
}