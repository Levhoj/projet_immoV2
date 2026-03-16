import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { ChevronLeft, MapPin, Maximize2, Home, TrendingUp, Lock } from 'lucide-react'
import CalculateurRentabilite from '@/components/calculateurs/CalculateurRentabilite'
import { isUserPremium } from '@/lib/supabase'

export default async function SimulerPage({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const { uuid } = await params
  const sp = await searchParams
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const isPremium = await isUserPremium(userId)

  // Lire les données depuis les params URL — zéro appel API supplémentaire
  const prix    = sp.prix    ? parseInt(sp.prix)    : undefined
  const surface = sp.surface ? parseInt(sp.surface) : undefined
  const copro   = sp.copro   ? parseInt(sp.copro)   : undefined
  const titre   = sp.titre   ?? 'Bien immobilier'
  const ville   = sp.ville   ?? ''
  const cp      = sp.cp      ?? ''
  const ppm     = sp.ppm     ? parseInt(sp.ppm)     : undefined
  const photo   = sp.photo   ?? ''
  const insee   = sp.insee   ?? ''
  const propType = sp.propType ? parseInt(sp.propType) : 0
  const room     = sp.room    ? parseInt(sp.room)    : 2

  const fraisNotaire = prix ? Math.round(prix * 0.08) : 16000

  const initialValues = { prix, notaire: fraisNotaire, copro, surface, insee, propertyType: propType, room }

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
            {titre}
          </Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-600">Simulation</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Rappel du bien — données depuis l'URL, 0 appel API */}
        <div className="bg-slate-900 rounded-2xl p-5 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
            {photo ? (
              <img src={photo} alt={titre} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home size={24} className="text-slate-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-sky-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">Simulation en cours</span>
            </div>
            <h1 className="text-white font-bold text-base truncate mb-1">{titre}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              {ville && (
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <MapPin size={11} />
                  <span>{ville} {cp && `(${cp})`}</span>
                </div>
              )}
              {surface && (
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Maximize2 size={11} />
                  <span>{surface} m²</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-extrabold text-white">
              {prix ? prix.toLocaleString('fr-FR') + ' €' : '—'}
            </div>
            {ppm && (
              <div className="text-xs text-slate-400">{ppm.toLocaleString('fr-FR')} €/m²</div>
            )}
          </div>

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
