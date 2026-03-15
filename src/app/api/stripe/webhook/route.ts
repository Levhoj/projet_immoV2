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
      const userId = session.metadata?.userId
      if (userId) {
        await setUserPremium(
          userId,
          true,
          session.customer as string,
          session.subscription as string,
        )
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const user = await getUserByStripeCustomerId(sub.customer as string)
      if (user) {
        await setUserPremium(user.clerk_user_id, false)
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const isActive = sub.status === 'active' || sub.status === 'trialing'
      const user = await getUserByStripeCustomerId(sub.customer as string)
      if (user) {
        await setUserPremium(user.clerk_user_id, isActive)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
