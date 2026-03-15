import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { checkRateLimit, verifyCsrf, rateLimitResponse, csrfErrorResponse, RATE_LIMITS } from '@/lib/security'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))
  }

  // CSRF
  if (!verifyCsrf(req)) return csrfErrorResponse()

  // Rate limiting
  const { allowed } = await checkRateLimit(
    userId, 'stripe_checkout',
    RATE_LIMITS.stripe_checkout.limit,
    RATE_LIMITS.stripe_checkout.window
  )
  if (!allowed) return rateLimitResponse('Trop de tentatives de paiement, réessayez dans une heure.')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID_MONTHLY!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/tarifs`,
    metadata: { userId },
    subscription_data: { trial_period_days: 14 },
  })

  return NextResponse.redirect(session.url!)
}
