import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSavedProperties, saveProperty, unsaveProperty } from '@/lib/supabase'
import { checkRateLimit, verifyCsrf, rateLimitResponse, csrfErrorResponse, RATE_LIMITS } from '@/lib/security'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const properties = await getSavedProperties(userId)
  return NextResponse.json(properties)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // CSRF
  if (!verifyCsrf(req)) return csrfErrorResponse()

  // Rate limiting
  const { allowed } = await checkRateLimit(
    userId, 'save_property',
    RATE_LIMITS.save_property.limit,
    RATE_LIMITS.save_property.window
  )
  if (!allowed) return rateLimitResponse('Limite de sauvegardes atteinte pour aujourd\'hui.')

  try {
    const body = await req.json()
    // Validation basique des champs
    if (!body.uuid || typeof body.uuid !== 'string') {
      return NextResponse.json({ error: 'UUID manquant' }, { status: 400 })
    }
    const saved = await saveProperty(userId, {
      uuid:    String(body.uuid).slice(0, 100),
      titre:   String(body.titre  ?? '').slice(0, 200),
      ville:   String(body.ville  ?? '').slice(0, 100),
      cp:      String(body.cp     ?? '').slice(0, 10),
      prix:    parseInt(body.prix)    || 0,
      surface: parseInt(body.surface) || 0,
      ppm:     parseInt(body.ppm)     || 0,
      photo:   String(body.photo  ?? '').slice(0, 500),
      copro:   parseInt(body.copro)   || 0,
    })
    return NextResponse.json(saved)
  } catch {
    return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // CSRF
  if (!verifyCsrf(req)) return csrfErrorResponse()

  // Rate limiting
  const { allowed } = await checkRateLimit(
    userId, 'delete_property',
    RATE_LIMITS.delete_property.limit,
    RATE_LIMITS.delete_property.window
  )
  if (!allowed) return rateLimitResponse()

  try {
    const { uuid } = await req.json()
    if (!uuid || typeof uuid !== 'string') {
      return NextResponse.json({ error: 'UUID manquant' }, { status: 400 })
    }
    await unsaveProperty(userId, uuid)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
