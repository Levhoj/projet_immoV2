import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  if (query.length < 2) return NextResponse.json([])

  try {
    const res = await fetch(
      `https://preprod-api.notif.immo/indicators/locations?search=${encodeURIComponent(query)}&itemsPerPage=8`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.MELO_API_KEY!,
        },
      }
    )
    if (!res.ok) {
      console.error('Melo locations error:', res.status, await res.text())
      return NextResponse.json([])
    }
    const data = await res.json()
    const members = data['hydra:member'] ?? []
    return NextResponse.json(members)
  } catch (err) {
    console.error('Melo locations fetch error:', err)
    return NextResponse.json([])
  }
}
