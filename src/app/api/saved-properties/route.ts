import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSavedProperties, saveProperty, unsaveProperty } from '@/lib/supabase'

// GET — liste des annonces sauvegardées
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const properties = await getSavedProperties(userId)
  return NextResponse.json(properties)
}

// POST — sauvegarder une annonce
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  try {
    const saved = await saveProperty(userId, body)
    return NextResponse.json(saved)
  } catch (err) {
    return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 })
  }
}

// DELETE — supprimer une annonce sauvegardée
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { uuid } = await req.json()
  try {
    await unsaveProperty(userId, uuid)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
