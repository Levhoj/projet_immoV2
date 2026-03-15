'use client'

import { UserProfile } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Crown, CheckCircle, XCircle, Settings, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

function AbonnementPanel() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    // Charger le statut premium
    fetch('/api/profil/status')
      .then(r => r.json())
      .then(data => {
        setIsPremium(data.isPremium)
        setSavedCount(data.savedCount)
      })
  }, [])

  if (isPremium === null) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-1">
      {/* Statut */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isPremium ? (
              <>
                <Crown size={16} className="text-amber-500" />
                <span className="font-semibold text-slate-900">Rendivo Premium</span>
              </>
            ) : (
              <span className="font-semibold text-slate-900">Plan gratuit</span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {isPremium
              ? 'Accès à tous les outils de simulation'
              : 'Accès limité aux outils de base'}
          </p>
        </div>
        {isPremium ? (
          <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-full">
            <CheckCircle size={11} /> Actif
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
            <XCircle size={11} /> Gratuit
          </span>
        )}
      </div>

      {/* Features */}
      <div className="space-y-2 mb-6">
        {[
          { label: 'Recherche immobilière (900+ sources)', included: true },
          { label: 'Calculateur de mensualité', included: true },
          { label: "Tableau d'amortissement", included: true },
          { label: `Annonces sauvegardées (${savedCount})`, included: true },
          { label: 'Rentabilité nette nette', included: isPremium },
          { label: '4 régimes fiscaux', included: isPremium },
          { label: 'Simulations illimitées', included: isPremium },
        ].map(({ label, included }) => (
          <div key={label} className={`flex items-center gap-2.5 text-sm ${included ? 'text-slate-700' : 'text-slate-300'}`}>
            {included
              ? <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
              : <XCircle size={13} className="text-slate-300 flex-shrink-0" />
            }
            {label}
          </div>
        ))}
      </div>

      {/* CTA */}
      {isPremium ? (
        <div>
          <a href="/api/stripe/portal"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-sm font-semibold text-slate-700 transition-colors">
            <Settings size={14} /> Gérer mon abonnement
          </a>
          <p className="text-xs text-slate-400 text-center mt-2">
            Modifier, annuler ou voir vos factures via Stripe.
          </p>
        </div>
      ) : (
        <div>
          <Link href="/tarifs"
            className="flex items-center justify-center gap-2 w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Crown size={14} /> Passer Premium — 9 € / mois <ArrowUpRight size={13} />
          </Link>
          <p className="text-xs text-slate-400 text-center mt-2">
            14 jours gratuits · Sans engagement
          </p>
        </div>
      )}
    </div>
  )
}

export default function ProfilPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <UserProfile>
          <UserProfile.Page
            label="Abonnement"
            labelIcon={<Crown size={16} />}
            url="abonnement"
          >
            <AbonnementPanel />
          </UserProfile.Page>
        </UserProfile>
      </div>
    </div>
  )
}
