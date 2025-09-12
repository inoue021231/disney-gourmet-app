import { NextResponse } from 'next/server'
import { getRestaurants } from '@/lib/api/foods'

export async function GET() {
  try {
    const restaurants = await getRestaurants()
    return NextResponse.json({ restaurants, success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants', success: false },
      { status: 500 }
    )
  }
}
