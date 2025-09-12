import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic認証の設定
  const basicAuth = request.headers.get('authorization')
  const url = request.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // 環境変数から認証情報を取得（デフォルト値付き）
    const validUser = process.env.BASIC_AUTH_USER || 'admin'
    const validPassword = process.env.BASIC_AUTH_PASSWORD || 'demo123'

    if (user === validUser && pwd === validPassword) {
      return NextResponse.next()
    }
  }

  url.pathname = '/api/auth'

  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.png (icon file)
     * - no-image-* (placeholder images)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png|no-image-.*|manifest.json|sw.js).*)',
  ],
}
