/**
 * API Route — Estimation du loyer mensuel pour un bien.
 * Utilise la carte des loyers ANIL 2025 stockée dans Supabase.
 * Source : Estimations ANIL, à partir des données du Groupe SeLoger et de leboncoin.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getLoyerCommune, getTypeBienAnil } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const inseeC       = searchParams.get('insee')
  const propertyType = parseInt(searchParams.get('propertyType') ?? '0')
  const room         = parseInt(searchParams.get('room') ?? '2')
  const surface      = parseFloat(searchParams.get('surface') ?? '0')

  // Validation
  if (!inseeC || !/^\d{5}$/.test(inseeC)) {
    return NextResponse.json({ error: 'Code INSEE invalide' }, { status: 400 })
  }
  if (surface <= 0 || surface > 10000) {
    return NextResponse.json({ error: 'Surface invalide' }, { status: 400 })
  }

  const typeBien = getTypeBienAnil(propertyType, room)
  if (!typeBien) {
    return NextResponse.json({ error: 'Type de bien non supporté' }, { status: 400 })
  }

  const loyer = await getLoyerCommune(inseeC, typeBien)
  if (!loyer) {
    return NextResponse.json({ error: 'Commune non trouvée' }, { status: 404 })
  }

  // Calcul du loyer mensuel estimé
  const loyerMensuel    = Math.round(loyer.loypredm2 * surface)
  const loyerMin        = Math.round(loyer.lwr_ipm2 * surface)
  const loyerMax        = Math.round(loyer.upr_ipm2 * surface)
  const fiabilite       = loyer.r2_adj >= 0.7 ? 'haute' : loyer.r2_adj >= 0.5 ? 'moyenne' : 'faible'

  return NextResponse.json({
    loyerMensuel,
    loyerMin,
    loyerMax,
    loypredm2: loyer.loypredm2,
    commune: loyer.libgeo,
    typeBien,
    nbObservations: loyer.nbobs_com,
    fiabilite,
    source: 'Estimations ANIL, à partir des données du Groupe SeLoger et de leboncoin',
  })
}
