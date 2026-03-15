import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client admin (server-side uniquement)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Client public (peut être utilisé côté client)
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
