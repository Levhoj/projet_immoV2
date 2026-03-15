import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserByClerkId, getSavedProperties } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [user, saved] = await Promise.all([
    getUserByClerkId(userId),
    getSavedProperties(userId),
  ])

  return NextResponse.json({
    isPremium: user?.is_premium ?? false,
    savedCount: saved.length,
  })
}
