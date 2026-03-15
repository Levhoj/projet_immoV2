import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { setUserPremium, getUserByStripeCustomerId } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkUserId = session.metadata?.userId
      const stripeCustomerId = session.customer as string
      const stripeSubscriptionId = session.subscription as string
      if (clerkUserId) {
        await setUserPremium(clerkUserId, true, stripeCustomerId, stripeSubscriptionId)
        console.log('✅ Premium activé pour userId:', clerkUserId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const isActive = sub.status === 'active' || sub.status === 'trialing'
      const stripeCustomerId = sub.customer as string
      const user = await getUserByStripeCustomerId(stripeCustomerId)
      if (user) {
        await setUserPremium(user.clerk_user_id, isActive, stripeCustomerId, sub.id)
        console.log('🔄 Abonnement mis à jour — statut:', sub.status, '— userId:', user.clerk_user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const stripeCustomerId = sub.customer as string
      const user = await getUserByStripeCustomerId(stripeCustomerId)
      if (user) {
        await setUserPremium(user.clerk_user_id, false, stripeCustomerId, sub.id)
        console.log('❌ Premium révoqué pour userId:', user.clerk_user_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
