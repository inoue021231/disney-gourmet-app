import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'ログアウトしました' })
  
  // セッションクッキーを削除
  response.cookies.delete('auth-session')
  
  return response
}
