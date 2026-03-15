import Link from 'next/link'
import { TrendingUp, Search, Calculator, FileSpreadsheet, ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    icon: Search,
    bg: 'bg-sky-50',
    color: 'text-sky-600',
    title: 'Recherche agrégée',
    desc: '900+ sources en temps réel. Leboncoin, SeLoger, PAP et bien d\'autres — dédoublonnés et filtrables.',
  },
  {
    icon: TrendingUp,
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
    title: 'Rentabilité nette nette',
    desc: 'Calcul complet après charges, emprunt et fiscalité. 4 régimes fiscaux disponibles.',
  },
  {
    icon: Calculator,
    bg: 'bg-amber-50',
    color: 'text-amber-600',
    title: 'Simulateur de prêt',
    desc: 'Mensualités, tableau d\'amortissement, assurance — tout calculé en temps réel.',
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
      <section className="bg-slate-900 pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              900+ sources d'annonces en temps réel
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Trouvez les meilleurs<br />
              <span className="text-sky-400">investissements immobiliers</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Agrégez toutes les annonces de France, simulez votre financement et calculez
              la rentabilité nette nette en quelques clics.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/login"
                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2">
                Commencer gratuitement <ArrowRight size={16} />
              </Link>
              <Link href="/recherche"
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-3.5 rounded-xl border border-slate-700 transition-colors">
                Voir les annonces
              </Link>
            </div>
          </div>

          {/* Mini dashboard preview */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-lg mx-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Rentabilité nette nette</div>
            <div className="text-4xl font-extrabold text-white mb-1">6,8 %</div>
            <div className="text-emerald-400 text-sm font-semibold mb-5">↑ Excellent investissement</div>
            <div className="space-y-2.5">
              {[
                ["Prix d'achat", '185 000 €'],
                ['Loyer mensuel', '980 €'],
                ['Cash-flow net', '+124 €/mois'],
                ['Régime fiscal', 'LMNP réel'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm border-t border-slate-700 pt-2.5">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-200 font-medium">{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 inline-block bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-500/20">
              Simulé en 3 clics
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-sky-500 py-5 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4">
          {[
            ['900+', "Sources d'annonces"],
            ['4', 'Régimes fiscaux'],
            ['100%', 'Rentabilité réelle'],
            ['3 clics', 'Pour simuler'],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-white">{val}</div>
              <div className="text-sky-100 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-2">Fonctionnalités</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Tout ce dont vous avez besoin</h2>
            <p className="text-sm text-slate-500">De la recherche d'annonces à l'analyse complète de rentabilité</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, bg, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-3">Inclus dans Rendivo</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              Tout ce qu'il faut pour investir intelligemment
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Une plateforme pensée pour les investisseurs particuliers qui veulent des données fiables.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {INCLUDED.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-white mb-1">9 €</div>
            <div className="text-slate-400 text-sm mb-2">/ mois · sans engagement</div>
            <div className="text-emerald-400 text-sm font-semibold mb-6">14 jours d'essai gratuit</div>
            <Link href="/tarifs"
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors inline-flex items-center gap-2">
              Voir les tarifs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sky-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={13} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">Rendivo</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/tarifs" className="text-slate-500 hover:text-white text-xs transition-colors">Tarifs</Link>
            <Link href="/login" className="text-slate-500 hover:text-white text-xs transition-colors">Connexion</Link>
          </div>
          <div className="text-slate-600 text-xs">© 2025 Rendivo</div>
        </div>
      </footer>

    </div>
  )
}
