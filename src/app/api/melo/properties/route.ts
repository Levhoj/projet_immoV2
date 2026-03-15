import { NextRequest, NextResponse } from 'next/server'

const MELO_BASE = 'https://preprod-api.notif.immo/documents/properties'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams()

  const forward = [
    'transactionType','budgetMin','budgetMax',
    'surfaceMin','surfaceMax','roomMin','roomMax',
    'bedroomMin','bedroomMax','page','itemsPerPage',
    'withCoherentPrice','expired','withLocation',
  ]
  forward.forEach(key => {
    const val = searchParams.get(key)
    if (val !== null) params.set(key, val)
  })

  const arrays = ['propertyTypes','includedDepartments','includedZipcodes','energyCategories','includedCities']
  arrays.forEach(key => {
    searchParams.getAll(key).forEach(v => params.append(`${key}[]`, v))
  })

  if (!params.has('itemsPerPage')) params.set('itemsPerPage', '12')
  if (!params.has('withCoherentPrice')) params.set('withCoherentPrice', 'true')
  if (!params.has('expired')) params.set('expired', 'false')
  params.set('order[createdAt]', 'desc')

  try {
    const res = await fetch(`${MELO_BASE}?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.MELO_API_KEY!,
      },
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erreur Melo' }, { status: 500 })
  }
}
