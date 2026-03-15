/**
 * Landing page publique
 */
import Link from 'next/link'
import { Calculator, TrendingUp, FileText, ArrowRight } from 'lucide-react'

const FEATURES = [
  {
    icon: Calculator,
    title: 'Calculateur de mensualité',
    desc: 'Simulez vos remboursements à taux fixe avec assurance de prêt incluse.',
  },
  {
    icon: FileText,
    title: "Tableau d'amortissement",
    desc: 'Visualisez chaque échéance mois par mois ou année par année.',
  },
  {
    icon: TrendingUp,
    title: 'Rentabilité nette nette',
    desc: 'Calculez votre rendement réel après charges, emprunt et fiscalité (4 régimes).',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-bold text-slate-900 text-lg">ImmoCalc</span>
        <div className="flex items-center gap-4">
          <Link href="/tarifs" className="text-sm text-slate-500 hover:text-slate-900">Tarifs</Link>
          <Link href="/login" className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors">
            Connexion
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-medium bg-brand-50 text-brand-600 px-3 py-1 rounded-full mb-6">
          Plateforme de simulation immobilière
        </span>
        <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
          Investissez mieux,<br />calculez juste.
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          La seule plateforme qui intègre charges, emprunt et fiscalité pour
          une rentabilité vraiment nette — pas juste brute.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            Commencer gratuitement <ArrowRight size={18} />
          </Link>
          <Link
            href="/tarifs"
            className="border border-slate-200 hover:border-slate-400 text-slate-700 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="border border-slate-100 rounded-xl p-6 hover:shadow-sm transition-shadow"
          >
            <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
              <Icon size={20} className="text-brand-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
