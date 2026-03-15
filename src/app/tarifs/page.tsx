import Link from 'next/link'
import { Check, Zap } from 'lucide-react'

const PLANS = [
  {
    name: 'Gratuit',
    price: '0 €',
    period: 'pour toujours',
    desc: 'Pour découvrir Rendivo',
    features: [
      'Recherche immobilière (900+ sources)',
      'Calculateur de mensualité',
      "Tableau d'amortissement",
      '3 simulations sauvegardées',
    ],
    cta: 'Commencer gratuitement',
    href: '/login',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '9 €',
    period: '/ mois',
    desc: 'Pour les investisseurs sérieux',
    features: [
      'Tout le plan Gratuit',
      'Rentabilité nette nette',
      '4 régimes fiscaux (micro, réel, LMNP)',
      'Emprunt intégré dans la rentabilité',
      'Simulations illimitées',
      'Export PDF',
      'Support prioritaire',
    ],
    cta: 'Essayer 14 jours gratuit',
    href: '/api/stripe/checkout',
    highlight: true,
  },
]

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-dark-900 pt-16 pb-12 px-6 text-center">
        <div className="section-tag" style={{color: '#38BDF8'}}>Tarifs</div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
          Simple et transparent
        </h1>
        <p className="text-dark-400 text-base max-w-md mx-auto">
          Commencez gratuitement. Passez Premium quand vous êtes prêt.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`rounded-2xl p-7 flex flex-col gap-5 ${
                plan.highlight
                  ? 'bg-dark-900 border-2 border-brand-500'
                  : 'bg-white border border-dark-200'
              }`}>
              {plan.highlight && (
                <div className="flex items-center gap-1.5 text-brand-400 text-xs font-bold">
                  <Zap size={12} /> Le plus populaire
                </div>
              )}
              <div>
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-dark-400' : 'text-dark-500'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-4xl font-extrabold tracking-tight ${plan.highlight ? 'text-white' : 'text-dark-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-dark-500' : 'text-dark-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-xs ${plan.highlight ? 'text-dark-500' : 'text-dark-400'}`}>
                  {plan.desc}
                </p>
              </div>
              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-brand-400' : 'text-accent-500'}`} />
                    <span className={plan.highlight ? 'text-dark-300' : 'text-dark-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}
                className={`mt-auto text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-brand-500 hover:bg-brand-600 text-white'
                    : 'bg-dark-50 hover:bg-dark-100 text-dark-700 border border-dark-200'
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-dark-400 mt-6">
          Paiement sécurisé par Stripe · Résiliation à tout moment · Sans engagement
        </p>
      </div>
    </div>
  )
}
