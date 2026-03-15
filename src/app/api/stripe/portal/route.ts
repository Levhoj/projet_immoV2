import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserByClerkId } from '@/lib/supabase'
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
    userId, 'stripe_portal',
    RATE_LIMITS.stripe_portal.limit,
    RATE_LIMITS.stripe_portal.window
  )
  if (!allowed) return rateLimitResponse('Trop d\'accès au portail, réessayez dans une heure.')

  const user = await getUserByClerkId(userId)
  if (!user?.stripe_customer_id) {
    return NextResponse.redirect(new URL('/tarifs', process.env.NEXT_PUBLIC_APP_URL!))
  }

  const session = await stripe.billingPortal.sessions.create({
    customer:   user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/tarifs`,
  })

  return NextResponse.redirect(session.url)
}
