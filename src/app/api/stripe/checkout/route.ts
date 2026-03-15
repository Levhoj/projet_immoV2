/**
 * API Route — Crée une session Stripe Checkout.
 * Appelée quand l'utilisateur clique sur "Passer Premium".
 * Redirige vers la page de paiement Stripe hébergée.
 */
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID_MONTHLY!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/tarifs`,
    metadata: { userId },
    subscription_data: {
      trial_period_days: 14, // 14 jours d'essai gratuit
    },
  })

  return NextResponse.redirect(session.url!)
}
