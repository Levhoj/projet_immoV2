import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'

const ANON_LOC_COOKIE = 'rendivo_loc_count'
const ANON_LOC_DATE_COOKIE = 'rendivo_loc_date'
const ANON_LOC_LIMIT = 20   // 20 requêtes d'autocomplétion max par jour pour les anonymes
const AUTH_LOC_LIMIT = 100  // 100 pour les inscrits

async function getLocCount(cookieName: string, dateCookieName: string): Promise<number> {
  const cookieStore = await cookies()
  const today = new Date().toISOString().split('T')[0]
  const date = cookieStore.get(dateCookieName)?.value
  if (date !== today) return 0
  return parseInt(cookieStore.get(cookieName)?.value ?? '0')
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  const { searchParams } = new URL(req.url)

  // ── Validation de la query ────────────────────────────────────────────────
  const query = searchParams.get('q') ?? ''
  if (query.length < 2 || query.length > 100) return NextResponse.json([])
  // Rejeter les caractères suspects
  if (!/^[\p{L}\p{N}\s\-']+$/u.test(query)) return NextResponse.json([])

  // ── Rate limiting ────────────────────────────────────────────────────────
  const cookieName     = userId ? `rendivo_loc_auth_${userId.slice(0, 8)}` : ANON_LOC_COOKIE
  const dateCookieName = userId ? `rendivo_loc_date_auth` : ANON_LOC_DATE_COOKIE
  const limit          = userId ? AUTH_LOC_LIMIT : ANON_LOC_LIMIT

  const count = await getLocCount(cookieName, dateCookieName)
  if (count >= limit) return NextResponse.json([])

  // ── Requête Melo ──────────────────────────────────────────────────────────
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
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    const members = data['hydra:member'] ?? []

    // Incrémenter le compteur
    const today = new Date().toISOString().split('T')[0]
    const response = NextResponse.json(members)
    response.cookies.set(cookieName, String(count + 1), { maxAge: 86400, path: '/' })
    response.cookies.set(dateCookieName, today, { maxAge: 86400, path: '/' })
    return response
  } catch {
    return NextResponse.json([])
  }
}
