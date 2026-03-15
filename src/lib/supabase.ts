import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client public (frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client admin (API routes uniquement — ne jamais exposer côté client)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ─── Helpers utilisateurs ─────────────────────────────────────────────────────

export async function getUserByClerkId(clerkUserId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()
  if (error) return null
  return data
}

export async function upsertUser(clerkUserId: string, email?: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert({ clerk_user_id: clerkUserId, email }, { onConflict: 'clerk_user_id' })
    .select()
    .single()
  if (error) return null
  return data
}

export async function setUserPremium(
  clerkUserId: string,
  isPremium: boolean,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_premium: isPremium,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
    })
    .eq('clerk_user_id', clerkUserId)
  return !error
}

export async function setUserPremiumByCustomerId(
  stripeCustomerId: string,
  isPremium: boolean
) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_premium: isPremium })
    .eq('stripe_customer_id', stripeCustomerId)
  return !error
}

export async function isUserPremium(clerkUserId: string): Promise<boolean> {
  const user = await getUserByClerkId(clerkUserId)
  return user?.is_premium ?? false
}
