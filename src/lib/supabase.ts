import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client admin (server-side uniquement)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Client public
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Fonctions utilisateurs ───────────────────────────────────────────────────

/** Crée un utilisateur s'il n'existe pas encore */
export async function upsertUser(clerkUserId: string, email?: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert({ clerk_user_id: clerkUserId, email }, { onConflict: 'clerk_user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Récupère un utilisateur par son clerk_user_id */
export async function getUserByClerkId(clerkUserId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()
  if (error) return null
  return data
}

/** Récupère un utilisateur par son stripe_customer_id */
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()
  if (error) return null
  return data
}

/** Active le Premium d'un utilisateur */
export async function setUserPremium(
  clerkUserId: string,
  isPremium: boolean,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert({
      clerk_user_id: clerkUserId,
      is_premium: isPremium,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      premium_expires_at: isPremium ? null : new Date().toISOString(),
    }, { onConflict: 'clerk_user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Vérifie si un utilisateur est Premium */
export async function isUserPremium(clerkUserId: string): Promise<boolean> {
  const user = await getUserByClerkId(clerkUserId)
  if (!user) return false
  return user.is_premium === true
}

/** Met à jour le stripe_customer_id d'un utilisateur */
export async function setStripeCustomerId(clerkUserId: string, stripeCustomerId: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .upsert({ clerk_user_id: clerkUserId, stripe_customer_id: stripeCustomerId }, { onConflict: 'clerk_user_id' })
  if (error) throw error
}


// ─── Annonces sauvegardées ────────────────────────────────────────────────────

export interface SavedProperty {
  id: string
  clerk_user_id: string
  uuid: string
  titre: string
  ville: string
  cp: string
  prix: number
  surface: number
  ppm: number
  photo: string
  copro: number
  created_at: string
}

export async function getSavedProperties(clerkUserId: string): Promise<SavedProperty[]> {
  const { data, error } = await supabaseAdmin
    .from('saved_properties')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function saveProperty(clerkUserId: string, property: Omit<SavedProperty, 'id' | 'clerk_user_id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin
    .from('saved_properties')
    .upsert({ clerk_user_id: clerkUserId, ...property }, { onConflict: 'clerk_user_id,uuid' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function unsaveProperty(clerkUserId: string, uuid: string) {
  const { error } = await supabaseAdmin
    .from('saved_properties')
    .delete()
    .eq('clerk_user_id', clerkUserId)
    .eq('uuid', uuid)
  if (error) throw error
}

export async function isPropertySaved(clerkUserId: string, uuid: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('saved_properties')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .eq('uuid', uuid)
    .single()
  return !!data
}


// ─── Rate limiting recherches ─────────────────────────────────────────────────

export const SEARCH_LIMITS = {
  anonymous: 2,
  free: 6,
  premium: Infinity,
}

export async function getSearchCount(clerkUserId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabaseAdmin
    .from('search_usage')
    .select('count')
    .eq('clerk_user_id', clerkUserId)
    .eq('date', today)
    .single()
  return data?.count ?? 0
}

export async function incrementSearchCount(clerkUserId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabaseAdmin
    .from('search_usage')
    .upsert(
      { clerk_user_id: clerkUserId, date: today, count: 1 },
      { onConflict: 'clerk_user_id,date' }
    )
    .select('count')
    .single()

  // Si la ligne existait déjà, incrémenter
  if (data) {
    const { data: updated } = await supabaseAdmin
      .from('search_usage')
      .update({ count: (data.count ?? 0) + 1 })
      .eq('clerk_user_id', clerkUserId)
      .eq('date', today)
      .select('count')
      .single()
    return updated?.count ?? 1
  }
  return 1
}

export async function canSearch(clerkUserId: string, isPremium: boolean): Promise<{ allowed: boolean; count: number; limit: number }> {
  if (isPremium) return { allowed: true, count: 0, limit: Infinity }
  const count = await getSearchCount(clerkUserId)
  const limit = SEARCH_LIMITS.free
  return { allowed: count < limit, count, limit }
}


// ─── Loyers ANIL ──────────────────────────────────────────────────────────────

export interface LoyerCommune {
  loypredm2: number
  lwr_ipm2: number
  upr_ipm2: number
  libgeo: string
  nbobs_com: number
  r2_adj: number
}

/**
 * Récupère le loyer médian au m² pour une commune et un type de bien.
 * @param inseeC   Code INSEE de la commune (ex: "75112")
 * @param typeBien "app12" (T1-T2), "app3" (T3+), "maison"
 */
export async function getLoyerCommune(
  inseeC: string,
  typeBien: 'app12' | 'app3' | 'maison'
): Promise<LoyerCommune | null> {
  const { data, error } = await supabaseAdmin
    .from('loyers_communes')
    .select('loypredm2, lwr_ipm2, upr_ipm2, libgeo, nbobs_com, r2_adj')
    .eq('insee_c', inseeC)
    .eq('type_bien', typeBien)
    .single()

  if (error || !data) return null
  return data as LoyerCommune
}

/**
 * Détermine le type de bien ANIL selon le type Melo et le nombre de pièces
 * propertyType : 0=appart, 1=maison, autres=null
 * room : nombre de pièces
 */
export function getTypeBienAnil(
  propertyType: number,
  room: number
): 'app12' | 'app3' | 'maison' | null {
  if (propertyType === 1) return 'maison'
  if (propertyType === 0) return room >= 3 ? 'app3' : 'app12'
  return null
}


// ─── Zones ABC / Vacance locative ─────────────────────────────────────────────

export interface ZoneAbc {
  zone_abc: string
  vacance_mois: number
  libgeo: string
}

export async function getZoneAbc(inseeC: string): Promise<ZoneAbc | null> {
  const { data, error } = await supabaseAdmin
    .from('zones_abc')
    .select('zone_abc, vacance_mois, libgeo')
    .eq('insee_c', inseeC)
    .single()
  if (error || !data) return null
  return data as ZoneAbc
}


// ─── Zones ABC / Vacance locative ─────────────────────────────────────────────

export interface ZoneAbc {
  zone_abc: string
  vacance_mois: number
  libgeo: string
}

export async function getZoneAbc(inseeC: string): Promise<ZoneAbc | null> {
  const { data, error } = await supabaseAdmin
    .from('zones_abc')
    .select('zone_abc, vacance_mois, libgeo')
    .eq('insee_c', inseeC)
    .single()
  if (error || !data) return null
  return data as ZoneAbc
}


// ─── Zones ABC / Vacance locative ─────────────────────────────────────────────

export interface ZoneAbc {
  zone_abc: string
  vacance_mois: number
  libgeo: string
}

export async function getZoneAbc(inseeC: string): Promise<ZoneAbc | null> {
  const { data, error } = await supabaseAdmin
    .from('zones_abc')
    .select('zone_abc, vacance_mois, libgeo')
    .eq('insee_c', inseeC)
    .single()
  if (error || !data) return null
  return data as ZoneAbc
}
