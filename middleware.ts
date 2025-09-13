import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl

  // セッションクッキーをチェック
  const sessionToken = request.cookies.get('auth-session')?.value

  if (sessionToken) {
    // シンプルなセッショントークンの検証
    const expectedToken = process.env.SESSION_SECRET || 'default-session-secret'
    
    if (sessionToken === expectedToken) {
      return NextResponse.next()
    } else {
      // トークンが無効な場合は削除
      const response = NextResponse.redirect(new URL('/api/auth', request.url))
      response.cookies.delete('auth-session')
      return response
    }
  }

  // Basic認証の設定
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // 環境変数から認証情報を取得（デフォルト値付き）
    const validUser = process.env.BASIC_AUTH_USER || 'admin'
    const validPassword = process.env.BASIC_AUTH_PASSWORD || 'demo123'

    if (user === validUser && pwd === validPassword) {
      // 認証成功時、シンプルなセッショントークンを設定
      const sessionToken = process.env.SESSION_SECRET || 'default-session-secret'

      const response = NextResponse.next()
      response.cookies.set('auth-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30日
        path: '/'
      })
      return response
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
