import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('sb-access-token') ||
        request.cookies.get('sb-auth-token') ||
        [...request.cookies.getAll()].find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

    const { pathname } = request.nextUrl

    // Only redirect page requests. Allow API routes to handle 401s inherently
    const isProtectedPage = pathname.startsWith('/notes')
    const isAuthPage = pathname === '/login' || pathname === '/signup'

    if (isProtectedPage && !session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/notes/:path*'],
}
