import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { Check, Zap, Crown, Settings, XCircle } from 'lucide-react'
import { getUserByClerkId } from '@/lib/supabase'

const FEATURES_FREE = [
  'Recherche immobilière (900+ sources)',
  'Calculateur de mensualité',
  "Tableau d'amortissement",
  'Annonces sauvegardées',
]

const FEATURES_PREMIUM = [
  'Tout le plan Gratuit',
  'Rentabilité nette nette',
  '4 régimes fiscaux (micro, réel, LMNP)',
  'Emprunt intégré dans la rentabilité',
  'Simulations illimitées',
  'Export PDF',
  'Support prioritaire',
]

export default async function TarifsPage() {
  const { userId } = await auth()
  const user = userId ? await getUserByClerkId(userId) : null
  const isPremium = user?.is_premium ?? false

  // ── Vue Premium actif ──────────────────────────────────────────────────────
  if (isPremium) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 pt-16 pb-12 px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Crown size={12} /> Abonné Premium
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Votre abonnement
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Vous avez accès à toutes les fonctionnalités Rendivo.
          </p>
        </div>

        <div className="max-w-lg mx-auto px-6 py-12">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={16} className="text-amber-500" />
                  <span className="font-bold text-white text-lg">Rendivo Premium</span>
                </div>
                <div className="text-slate-400 text-sm">9 € / mois · sans engagement</div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                ✓ Actif
              </span>
            </div>

            <ul className="space-y-2.5 mb-7">
              {FEATURES_PREMIUM.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check size={14} className="text-amber-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <a href="/api/stripe/portal"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-600 hover:border-slate-400 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              <Settings size={15} /> Gérer mon abonnement
            </a>
            <p className="text-xs text-slate-500 text-center mt-3">
              Modifier, annuler ou consulter vos factures via Stripe.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Vue connecté plan gratuit ──────────────────────────────────────────────
  if (userId && !isPremium) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-slate-900 pt-16 pb-12 px-6 text-center">
          <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-3">Votre abonnement</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Passez à Premium
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Débloquez la simulation de rentabilité complète et tous les outils avancés.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Plan actuel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Plan gratuit</span>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">Actuel</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">0 € <span className="text-base font-normal text-slate-400">/ mois</span></div>
              </div>
              <ul className="flex flex-col gap-2.5 flex-1">
                {[
                  { label: 'Recherche immobilière', ok: true },
                  { label: 'Calculateur de mensualité', ok: true },
                  { label: "Tableau d'amortissement", ok: true },
                  { label: 'Annonces sauvegardées', ok: true },
                  { label: 'Rentabilité nette nette', ok: false },
                  { label: '4 régimes fiscaux', ok: false },
                  { label: 'Simulations illimitées', ok: false },
                ].map(({ label, ok }) => (
                  <li key={label} className={`flex items-center gap-2.5 text-sm ${ok ? 'text-slate-600' : 'text-slate-300'}`}>
                    {ok
                      ? <Check size={13} className="text-emerald-500 flex-shrink-0" />
                      : <XCircle size={13} className="text-slate-300 flex-shrink-0" />
                    }
                    {label}
                  </li>
                ))}
              </ul>
              <div className="py-3 rounded-xl bg-slate-50 text-center text-sm text-slate-400 font-medium border border-slate-200">
                Plan actuel
              </div>
            </div>

            {/* Plan Premium */}
            <div className="bg-slate-900 border-2 border-sky-500 rounded-2xl p-7 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold mb-2">
                  <Zap size={12} /> Recommandé
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">Premium</span>
                </div>
                <div className="text-3xl font-extrabold text-white">9 € <span className="text-base font-normal text-slate-400">/ mois</span></div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">14 jours gratuits</div>
              </div>
              <ul className="flex flex-col gap-2.5 flex-1">
                {FEATURES_PREMIUM.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check size={13} className="text-sky-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a href="/api/stripe/checkout"
                className="flex items-center justify-center gap-2 w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                <Crown size={14} /> Passer Premium
              </a>
              <p className="text-xs text-slate-500 text-center -mt-2">
                Sans engagement · Résiliation à tout moment
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Vue visiteur non connecté ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 pt-16 pb-12 px-6 text-center">
        <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-3">Tarifs</p>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Simple et transparent</h1>
        <p className="text-slate-400 text-base max-w-md mx-auto">Commencez gratuitement. Passez Premium quand vous êtes prêt.</p>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              name: 'Gratuit',
              price: '0 €',
              period: 'pour toujours',
              desc: 'Pour découvrir Rendivo',
              features: FEATURES_FREE,
              cta: 'Commencer gratuitement',
              href: '/signup',
              highlight: false,
            },
            {
              name: 'Premium',
              price: '9 €',
              period: '/ mois',
              desc: '14 jours d\'essai gratuit',
              features: FEATURES_PREMIUM,
              cta: 'Essayer gratuitement',
              href: '/signup',
              highlight: true,
            },
          ].map((plan) => (
            <div key={plan.name}
              className={`rounded-2xl p-7 flex flex-col gap-5 ${
                plan.highlight ? 'bg-slate-900 border-2 border-sky-500' : 'bg-white border border-slate-200'
              }`}>
              {plan.highlight && (
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold">
                  <Zap size={12} /> Le plus populaire
                </div>
              )}
              <div>
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-extrabold tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-slate-500' : 'text-slate-400'}`}>{plan.period}</span>
                </div>
                <p className={`text-xs ${plan.highlight ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>{plan.desc}</p>
              </div>
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={14} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-sky-400' : 'text-emerald-500'}`} />
                    <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}
                className={`mt-auto text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-sky-500 hover:bg-sky-600 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          Paiement sécurisé par Stripe · Résiliation à tout moment · Sans engagement
        </p>
      </div>
    </div>
  )
}
