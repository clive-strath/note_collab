import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('sb-access-token') ||
        request.cookies.get('sb-auth-token') ||
        // Supabase stores token in various cookie names depending on version
        [...request.cookies.getAll()].find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

    const { pathname } = request.nextUrl

    const isProtected = pathname.startsWith('/notes') || pathname.startsWith('/api/notes') || pathname.startsWith('/api/folders')
    const isAuthPage = pathname === '/login' || pathname === '/signup'

    if (isProtected && !session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/notes/:path*', '/api/notes/:path*', '/api/folders/:path*'],
}
