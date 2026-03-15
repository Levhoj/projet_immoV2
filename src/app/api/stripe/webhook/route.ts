/**
 * API Route — Webhook Stripe.
 * Reçoit les événements Stripe et met à jour le statut Premium.
 *
 * Configuration dans le Dashboard Stripe :
 * Developers > Webhooks > Add endpoint
 * URL : https://tondomaine.com/api/stripe/webhook
 * Événements à écouter :
 *   - checkout.session.completed
 *   - customer.subscription.deleted
 *   - customer.subscription.updated
 *
 * En local, utiliser Stripe CLI :
 *   stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json(
      { error: 'Webhook signature invalide' },
      { status: 400 }
    )
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId  = session.metadata?.userId
      // TODO: sauvegarder en base (Supabase) :
      //   UPDATE users SET is_premium = true, stripe_customer_id = ... WHERE id = userId
      console.log('✅ Paiement réussi — userId:', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      // TODO: révoquer l'accès Premium :
      //   UPDATE users SET is_premium = false WHERE stripe_customer_id = sub.customer
      console.log('❌ Abonnement annulé — customer:', sub.customer)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const isActive = sub.status === 'active' || sub.status === 'trialing'
      // TODO: mettre à jour le statut Premium selon isActive
      console.log('🔄 Abonnement mis à jour — statut:', sub.status)
      break
    }
  }

  return NextResponse.json({ received: true })
}
