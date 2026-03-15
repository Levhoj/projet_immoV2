import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { ChevronLeft, MapPin, Maximize2, Home, TrendingUp, Lock } from 'lucide-react'
import CalculateurRentabilite from '@/components/calculateurs/CalculateurRentabilite'
import { isUserPremium } from '@/lib/supabase'

async function getProperty(uuid: string) {
  try {
    const res = await fetch(
      `https://preprod-api.notif.immo/documents/properties/${uuid}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.MELO_API_KEY!,
        },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function SimulerPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = await params
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const [property, isPremium] = await Promise.all([
    getProperty(uuid),
    isUserPremium(userId),
  ])

  if (!property) notFound()

  const advert = property.adverts?.[0]
  const pics = advert?.pictures?.length ? advert.pictures : advert?.picturesRemote ?? []
  const pic = pics[0] ?? null

  // Calcul automatique des frais de notaire (~8% pour l'ancien)
  const fraisNotaire = property.price > 0 ? Math.round(property.price * 0.08) : 16000

  const initialValues = {
    prix:    property.price > 0 ? property.price : undefined,
    notaire: fraisNotaire,
    copro:   advert?.condominiumFees > 0 ? advert.condominiumFees : undefined,
    surface: property.surface > 0 ? property.surface : undefined,
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={28} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
            Fonctionnalité Premium
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            La simulation de rentabilité est réservée aux abonnés Premium.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tarifs" className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Voir les offres Premium
            </Link>
            <Link href={`/annonce/${uuid}`} className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-xl font-medium border border-slate-200 transition-colors">
              Retour à l'annonce
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/recherche" className="text-slate-400 hover:text-sky-500 transition-colors">Recherche</Link>
          <span className="text-slate-200">/</span>
          <Link href={`/annonce/${uuid}`} className="text-slate-400 hover:text-sky-500 transition-colors truncate max-w-xs">
            {property.title}
          </Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-600">Simulation</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Rappel du bien */}
        <div className="bg-slate-900 rounded-2xl p-5 mb-8 flex items-center gap-5">
          {/* Photo */}
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
            {pic ? (
              <img src={pic} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home size={24} className="text-slate-500" />
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-sky-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">Simulation en cours</span>
            </div>
            <h1 className="text-white font-bold text-base truncate mb-1">{property.title}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <MapPin size={11} />
                <span>{property.city.name} ({property.city.zipcode})</span>
              </div>
              {property.surface > 0 && (
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Maximize2 size={11} />
                  <span>{property.surface} m²</span>
                </div>
              )}
            </div>
          </div>

          {/* Prix */}
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-extrabold text-white">
              {property.price > 0 ? property.price.toLocaleString('fr-FR') + ' €' : '—'}
            </div>
            {property.pricePerMeter > 0 && (
              <div className="text-xs text-slate-400">{Math.round(property.pricePerMeter).toLocaleString('fr-FR')} €/m²</div>
            )}
          </div>

          {/* Lien retour */}
          <Link href={`/annonce/${uuid}`}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-lg transition-colors ml-2">
            <ChevronLeft size={13} /> Annonce
          </Link>
        </div>

        {/* Infos pré-remplies */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-5 py-3 mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
          <p className="text-sm text-sky-700">
            Le calculateur a été pré-rempli avec les données de l'annonce.
            Les frais de notaire ont été estimés à <strong>8%</strong> du prix d'achat.
            Complétez les informations manquantes pour affiner la simulation.
          </p>
        </div>

        {/* Calculateur pré-rempli */}
        <CalculateurRentabilite initial={initialValues} />

      </div>
    </div>
  )
}
