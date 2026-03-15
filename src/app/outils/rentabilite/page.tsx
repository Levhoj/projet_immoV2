/**
 * Page outil : Rentabilité nette nette (accès Premium uniquement)
 * Vérifie le statut premium avant d'afficher le simulateur.
 * TODO : brancher la vérification réelle via Supabase ou Clerk metadata.
 */
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default async function RentabilitePage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  // TODO: vérifier le vrai statut premium en base
  const isPremium = false

  if (!isPremium) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={24} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Fonctionnalité Premium
        </h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Le calculateur de rentabilité nette nette avec les 4 régimes fiscaux
          est réservé aux abonnés Premium.
        </p>
        <Link
          href="/tarifs"
          className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
        >
          Voir les offres Premium
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Rentabilité nette nette
      </h1>
      <p className="text-slate-500 mb-8">4 régimes fiscaux · Emprunt intégré</p>
      {/* TODO: <CalculateurRentabilite /> */}
      <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
        Composant React à intégrer
      </div>
    </div>
  )
}
