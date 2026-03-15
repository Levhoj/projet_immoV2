/**
 * Page tarifs — 2 plans : Gratuit et Premium.
 * Le bouton Premium appelle /api/stripe/checkout pour créer la session de paiement.
 */
import Link from 'next/link'
import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Gratuit',
    price: '0 €',
    period: 'pour toujours',
    features: [
      'Calculateur de mensualité',
      "Tableau d'amortissement",
      '3 simulations sauvegardées',
      'Accès web et mobile',
    ],
    cta: 'Commencer gratuitement',
    href: '/login',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '9 €',
    period: '/ mois',
    features: [
      'Tout le plan Gratuit',
      'Rentabilité nette nette',
      '4 régimes fiscaux (micro-foncier, réel, LMNP)',
      'Emprunt intégré dans la rentabilité',
      'Simulations illimitées',
      'Export PDF des simulations',
      'Support prioritaire',
    ],
    cta: 'Essayer 14 jours gratuit',
    href: '/api/stripe/checkout',
    highlight: true,
  },
]

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-bold text-slate-900 text-lg">ImmoCalc</Link>
        <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900">Connexion</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Tarifs simples</h1>
          <p className="text-slate-500 text-lg">
            Commencez gratuitement. Passez Premium quand vous êtes prêt.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border bg-white p-8 flex flex-col gap-6 ${
                plan.highlight
                  ? 'border-brand-500 shadow-lg shadow-brand-100'
                  : 'border-slate-200'
              }`}
            >
              {plan.highlight && (
                <span className="self-start text-xs font-medium bg-brand-50 text-brand-600 px-3 py-1 rounded-full">
                  Le plus populaire
                </span>
              )}
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{plan.name}</p>
                <p className="text-4xl font-bold text-slate-900">
                  {plan.price}{' '}
                  <span className="text-base font-normal text-slate-400">{plan.period}</span>
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check size={16} className="text-brand-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-auto text-center py-3 rounded-lg font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'border border-slate-200 hover:border-slate-400 text-slate-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Paiement sécurisé par Stripe · Résiliation à tout moment · Sans engagement
        </p>
      </div>
    </main>
  )
}
