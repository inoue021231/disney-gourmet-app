import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('認証が必要です', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Private Site"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
