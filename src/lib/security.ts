import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase'

// ─── Rate limiting générique via Supabase ─────────────────────────────────────
// Table utilisée : search_usage (réutilisée avec un préfixe d'action)

export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowSeconds = 86400 // 1 jour par défaut
): Promise<{ allowed: boolean; count: number }> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

  // Compter les actions récentes
  const { count } = await supabaseAdmin
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('clerk_user_id', userId)
    .eq('action', action)
    .gte('created_at', windowStart)

  const current = count ?? 0
  if (current >= limit) return { allowed: false, count: current }

  // Enregistrer l'action
  await supabaseAdmin
    .from('rate_limits')
    .insert({ clerk_user_id: userId, action })

  return { allowed: true, count: current + 1 }
}

// ─── Limites par action ────────────────────────────────────────────────────────
export const RATE_LIMITS = {
  save_property:    { limit: 200,  window: 86400  }, // 200 sauvegardes/jour
  delete_property:  { limit: 200,  window: 86400  }, // 200 suppressions/jour
  stripe_checkout:  { limit: 5,    window: 3600   }, // 5 tentatives/heure
  stripe_portal:    { limit: 10,   window: 3600   }, // 10 accès portail/heure
}

// ─── Protection CSRF ───────────────────────────────────────────────────────────
// On vérifie que la requête vient bien de notre domaine

export function verifyCsrf(req: NextRequest): boolean {
  const origin  = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // En développement on est plus permissif
  if (appUrl.includes('localhost')) return true

  // Vérifier que origin ou referer correspond à notre domaine
  const source = origin ?? referer ?? ''
  return source.startsWith(appUrl)
}

// ─── Helper — réponse d'erreur rate limit ─────────────────────────────────────
export function rateLimitResponse(message = 'Trop de requêtes, réessayez plus tard.') {
  return NextResponse.json({ error: 'RATE_LIMIT', message }, { status: 429 })
}

// ─── Helper — réponse d'erreur CSRF ──────────────────────────────────────────
export function csrfErrorResponse() {
  return NextResponse.json({ error: 'CSRF', message: 'Requête non autorisée.' }, { status: 403 })
}
