import Link from 'next/link'
import { TrendingUp, Search, Calculator, FileSpreadsheet, ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    icon: Search,
    color: 'bg-brand-50 text-brand-600',
    title: 'Recherche agrégée',
    desc: '900+ sources en temps réel. Leboncoin, SeLoger, PAP et bien d\'autres — dédoublonnés et filtrables.',
  },
  {
    icon: TrendingUp,
    color: 'bg-accent-50 text-accent-600',
    title: 'Rentabilité nette nette',
    desc: 'Calcul complet après charges, emprunt et fiscalité. 4 régimes fiscaux : micro-foncier, réel, LMNP.',
  },
  {
    icon: Calculator,
    color: 'bg-amber-50 text-amber-600',
    title: 'Simulateur de prêt',
    desc: 'Mensualités, tableau d\'amortissement, assurance — tout calculé en temps réel sur chaque annonce.',
  },
]

const INCLUDED = [
  'Recherche sur 900+ portails',
  'Calculateur de mensualité',
  "Tableau d'amortissement",
  'Rentabilité nette nette',
  '4 régimes fiscaux',
  'Cash-flow mensuel net',
]

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-dark-900 pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 inline-block"></span>
              900+ sources d'annonces en temps réel
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Trouvez les meilleurs<br />
              <span className="text-brand-400">investissements immobiliers</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Agrégez toutes les annonces de France, simulez votre financement et calculez
              la rentabilité nette nette en quelques clics.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/login"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2">
                Commencer gratuitement <ArrowRight size={16} />
              </Link>
              <Link href="/recherche"
                className="bg-dark-800 hover:bg-dark-700 text-white font-medium px-8 py-3.5 rounded-xl border border-dark-700 transition-colors">
                Voir les annonces
              </Link>
            </div>
          </div>

          {/* Mini dashboard preview */}
          <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 max-w-lg mx-auto">
            <div className="text-xs font-semibold text-dark-500 uppercase tracking-widest mb-1">Rentabilité nette nette</div>
            <div className="text-4xl font-extrabold text-white mb-1">6,8 %</div>
            <div className="text-accent-400 text-sm font-semibold mb-5">↑ Excellent investissement</div>
            <div className="space-y-2.5">
              {[
                ['Prix d\'achat', '185 000 €'],
                ['Loyer mensuel', '980 €'],
                ['Cash-flow net', '+124 €/mois'],
                ['Régime fiscal', 'LMNP réel'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm border-t border-dark-700 pt-2.5">
                  <span className="text-dark-500">{label}</span>
                  <span className="text-dark-200 font-medium">{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 inline-block bg-accent-500/10 text-accent-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-accent-500/20">
              Simulé en 3 clics
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-500 py-5 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4">
          {[
            ['900+', 'Sources d\'annonces'],
            ['4', 'Régimes fiscaux'],
            ['100%', 'Rentabilité réelle'],
            ['3 clics', 'Pour simuler'],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-white">{val}</div>
              <div className="text-brand-100 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-dark-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag">Fonctionnalités</div>
            <h2 className="section-title">Tout ce dont vous avez besoin</h2>
            <p className="section-sub">De la recherche d'annonces à l'analyse complète de rentabilité</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-dark-900 mb-2">{title}</h3>
                <p className="text-sm text-dark-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-900 py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="section-tag">Inclus dans Rendivo</div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              Tout ce qu'il faut pour investir intelligemment
            </h2>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Une plateforme pensée pour les investisseurs particuliers qui veulent des données fiables et des calculs précis.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {INCLUDED.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-dark-300">
                  <CheckCircle size={14} className="text-accent-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-white mb-1">9 €</div>
            <div className="text-dark-400 text-sm mb-2">/ mois · sans engagement</div>
            <div className="text-accent-400 text-sm font-semibold mb-6">14 jours d'essai gratuit</div>
            <Link href="/tarifs"
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2">
              Voir les tarifs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={13} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">Rendivo</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/tarifs" className="text-dark-500 hover:text-white text-xs transition-colors">Tarifs</Link>
            <Link href="/login" className="text-dark-500 hover:text-white text-xs transition-colors">Connexion</Link>
          </div>
          <div className="text-dark-600 text-xs">© 2025 Rendivo</div>
        </div>
      </footer>

    </div>
  )
}
