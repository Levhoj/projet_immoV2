/**
 * Fonctions utilitaires pour gérer les utilisateurs en base Supabase.
 */
import { supabaseAdmin } from './supabase'

/**
 * Récupère un utilisateur par son clerk_user_id.
 * Crée l'entrée si elle n'existe pas encore.
 */
export async function getOrCreateUser(clerkUserId: string, email?: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error && error.code === 'PGRST116') {
    // Utilisateur inexistant → on le crée
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({ clerk_user_id: clerkUserId, email })
      .select()
      .single()

    if (insertError) throw insertError
    return newUser
  }

  if (error) throw error
  return data
}

/**
 * Vérifie si un utilisateur est Premium.
 */
export async function isPremiumUser(clerkUserId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('is_premium, premium_expires_at')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error || !data) return false

  if (!data.is_premium) return false

  // Vérifier l'expiration si définie
  if (data.premium_expires_at) {
    return new Date(data.premium_expires_at) > new Date()
  }

  return true
}

/**
 * Active le Premium pour un utilisateur.
 */
export async function activatePremium(
  clerkUserId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
) {
  const { error } = await supabaseAdmin
    .from('users')
    .upsert({
      clerk_user_id: clerkUserId,
      is_premium: true,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
    }, { onConflict: 'clerk_user_id' })

  if (error) throw error
}

/**
 * Désactive le Premium pour un utilisateur via son stripe_customer_id.
 */
export async function deactivatePremiumByCustomer(stripeCustomerId: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_premium: false, stripe_subscription_id: null })
    .eq('stripe_customer_id', stripeCustomerId)

  if (error) throw error
}

/**
 * Récupère le clerk_user_id depuis un stripe_customer_id.
 */
export async function getClerkUserIdByCustomer(stripeCustomerId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('clerk_user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()

  if (error || !data) return null
  return data.clerk_user_id
}
