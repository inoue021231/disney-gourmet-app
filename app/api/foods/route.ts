import { NextResponse } from 'next/server'
import { getCurrentFoods } from '@/lib/api/foods'

export async function GET() {
  try {
    const foods = await getCurrentFoods()
    return NextResponse.json({ foods, success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch foods', success: false },
      { status: 500 }
    )
  }
}
