import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { isUserPremium, canSearch, incrementSearchCount, SEARCH_LIMITS } from '@/lib/supabase'
import { cookies } from 'next/headers'

const MELO_BASE = 'https://preprod-api.notif.immo/documents/properties'
const ANON_COOKIE = 'rendivo_search_count'
const ANON_DATE_COOKIE = 'rendivo_search_date'

// Rate limiting pour les visiteurs non connectés via cookie
async function getAnonSearchCount(): Promise<number> {
  const cookieStore = await cookies()
  const today = new Date().toISOString().split('T')[0]
  const date = cookieStore.get(ANON_DATE_COOKIE)?.value
  if (date !== today) return 0
  return parseInt(cookieStore.get(ANON_COOKIE)?.value ?? '0')
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  const { searchParams } = new URL(req.url)

  // ── Rate limiting ──────────────────────────────────────────────────────────
  if (!userId) {
    // Visiteur anonyme — vérification via cookie
    const count = await getAnonSearchCount()
    if (count >= SEARCH_LIMITS.anonymous) {
      return NextResponse.json({
        error: 'LIMIT_REACHED',
        message: `Vous avez atteint la limite de ${SEARCH_LIMITS.anonymous} recherches. Inscrivez-vous gratuitement pour en faire plus.`,
        limit: SEARCH_LIMITS.anonymous,
        count,
      }, { status: 429 })
    }
  } else {
    // Utilisateur connecté
    const premium = await isUserPremium(userId)
    if (!premium) {
      const { allowed, count, limit } = await canSearch(userId, false)
      if (!allowed) {
        return NextResponse.json({
          error: 'LIMIT_REACHED',
          message: `Vous avez atteint la limite de ${limit} recherches aujourd'hui. Passez Premium pour des recherches illimitées.`,
          limit,
          count,
        }, { status: 429 })
      }
    }
  }

  // ── Requête Melo ───────────────────────────────────────────────────────────
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

    // ── Incrémenter le compteur après succès ───────────────────────────────
    const today = new Date().toISOString().split('T')[0]
    const response = NextResponse.json(data)

    if (!userId) {
      // Cookie pour anonymes
      const count = await getAnonSearchCount()
      response.cookies.set(ANON_COOKIE, String(count + 1), { maxAge: 86400, path: '/' })
      response.cookies.set(ANON_DATE_COOKIE, today, { maxAge: 86400, path: '/' })
    } else {
      const premium = await isUserPremium(userId)
      if (!premium) await incrementSearchCount(userId)
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Erreur Melo' }, { status: 500 })
  }
}
