import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { isUserPremium, canSearch, incrementSearchCount, SEARCH_LIMITS } from '@/lib/supabase'
import { cookies } from 'next/headers'

const MELO_BASE = 'https://preprod-api.notif.immo/documents/properties'
const ANON_COOKIE = 'rendivo_search_count'
const ANON_DATE_COOKIE = 'rendivo_search_date'

// ── Validation des paramètres ──────────────────────────────────────────────
const VALID_PROPERTY_TYPES = ['0', '1', '2', '3', '4', '5', '6']
const VALID_TRANSACTION_TYPES = ['0', '1']
const VALID_ENERGY_CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

function validateInt(val: string | null, min: number, max: number): string | null {
  if (!val) return null
  const n = parseInt(val)
  if (isNaN(n) || n < min || n > max) return null
  return String(n)
}

function validateFloat(val: string | null, min: number, max: number): string | null {
  if (!val) return null
  const n = parseFloat(val)
  if (isNaN(n) || n < min || n > max) return null
  return String(n)
}

function validateEnum(val: string, allowed: string[]): string | null {
  return allowed.includes(val) ? val : null
}

// ── Rate limiting anonyme via cookie ──────────────────────────────────────
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

  // ── Rate limiting ────────────────────────────────────────────────────────
  if (!userId) {
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

  // ── Validation et construction des params ────────────────────────────────
  const params = new URLSearchParams()

  // Transaction type
  const transactionType = validateEnum(
    searchParams.get('transactionType') ?? '0',
    VALID_TRANSACTION_TYPES
  )
  if (transactionType) params.set('transactionType', transactionType)

  // Budgets
  const budgetMin = validateInt(searchParams.get('budgetMin'), 0, 100000000)
  const budgetMax = validateInt(searchParams.get('budgetMax'), 0, 100000000)
  if (budgetMin) params.set('budgetMin', budgetMin)
  if (budgetMax) params.set('budgetMax', budgetMax)

  // Surfaces
  const surfaceMin = validateInt(searchParams.get('surfaceMin'), 0, 100000)
  const surfaceMax = validateInt(searchParams.get('surfaceMax'), 0, 100000)
  if (surfaceMin) params.set('surfaceMin', surfaceMin)
  if (surfaceMax) params.set('surfaceMax', surfaceMax)

  // Pièces / chambres
  const roomMin = validateInt(searchParams.get('roomMin'), 0, 20)
  const roomMax = validateInt(searchParams.get('roomMax'), 0, 20)
  if (roomMin) params.set('roomMin', roomMin)
  if (roomMax) params.set('roomMax', roomMax)

  // Pagination
  const page = validateInt(searchParams.get('page'), 1, 1000) ?? '1'
  const itemsPerPage = validateInt(searchParams.get('itemsPerPage'), 1, 12) ?? '12'
  params.set('page', page)
  params.set('itemsPerPage', itemsPerPage)

  // Types de biens — valider chaque valeur
  searchParams.getAll('propertyTypes').forEach(v => {
    if (validateEnum(v, VALID_PROPERTY_TYPES)) params.append('propertyTypes[]', v)
  })

  // Catégories énergie
  searchParams.getAll('energyCategories').forEach(v => {
    if (validateEnum(v, VALID_ENERGY_CATEGORIES)) params.append('energyCategories[]', v)
  })

  // Localisations — accepter seulement des formats connus
  searchParams.getAll('includedDepartments').forEach(v => {
    if (/^\/departments\/\d+$/.test(v)) params.append('includedDepartments[]', v)
  })
  searchParams.getAll('includedCities').forEach(v => {
    if (/^\/cities\/\d+$/.test(v)) params.append('includedCities[]', v)
  })
  searchParams.getAll('includedZipcodes').forEach(v => {
    if (/^\d{5}$/.test(v)) params.append('includedZipcodes[]', v)
  })

  // Valeurs booléennes
  params.set('withCoherentPrice', 'true')
  params.set('expired', 'false')
  params.set('order[createdAt]', 'desc')

  // ── Requête Melo ──────────────────────────────────────────────────────────
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

    // ── Incrémenter le compteur après succès ─────────────────────────────
    const today = new Date().toISOString().split('T')[0]
    const response = NextResponse.json(data)
    if (!userId) {
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
