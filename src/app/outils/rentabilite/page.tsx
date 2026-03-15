import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { isPremiumUser } from '@/lib/supabase'
import CalculateurRentabilite from '@/components/calculateurs/CalculateurRentabilite'

export default async function RentabilitePage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const premium = await isPremiumUser(userId)

  if (!premium) {
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
            Le calculateur de rentabilité nette nette avec les 4 régimes fiscaux est réservé aux abonnés Premium.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tarifs"
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Voir les offres Premium
            </Link>
            <Link href="/dashboard"
              className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-xl font-medium border border-slate-200 transition-colors">
              Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Rentabilité nette nette</h1>
          <p className="text-slate-500">4 régimes fiscaux · Emprunt intégré · Cash-flow réel</p>
        </div>
        <CalculateurRentabilite />
      </div>
    </div>
  )
}
