import { NextRequest, NextResponse } from 'next/server'
import { getZoneAbc } from '@/lib/supabase'

const ZONE_LABELS: Record<string, string> = {
  'Abis': 'Très tendu',
  'A':    'Tendu',
  'B1':   'Assez tendu',
  'B2':   'Modéré',
  'C':    'Détendu',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const inseeC = searchParams.get('insee')

  if (!inseeC || !/^\d{5}$/.test(inseeC)) {
    return NextResponse.json({ error: 'Code INSEE invalide' }, { status: 400 })
  }

  const zone = await getZoneAbc(inseeC)
  if (!zone) {
    return NextResponse.json({ error: 'Commune non trouvée' }, { status: 404 })
  }

  return NextResponse.json({
    zone:          zone.zone_abc,
    zoneLabel:     ZONE_LABELS[zone.zone_abc] ?? zone.zone_abc,
    vacanceMois:   zone.vacance_mois,
    commune:       zone.libgeo,
  })
}
