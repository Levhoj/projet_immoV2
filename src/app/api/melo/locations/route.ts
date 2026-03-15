import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  if (query.length < 2) return NextResponse.json([])

  try {
    const res = await fetch(
      `https://api.notif.immo/indicators/locations?search=${encodeURIComponent(query)}&itemsPerPage=8`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.MELO_API_KEY!,
        },
      }
    )
    const data = await res.json()
    return NextResponse.json(data['hydra:member'] ?? [])
  } catch {
    return NextResponse.json([])
  }
}
