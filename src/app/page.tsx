import Link from 'next/link'
import { Calculator, TrendingUp, FileText, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: Calculator, title: 'Calculateur de mensualité', desc: 'Simulez vos remboursements à taux fixe avec assurance de prêt incluse.' },
  { icon: FileText, title: "Tableau d'amortissement", desc: 'Visualisez chaque échéance mois par mois ou année par année.' },
  { icon: TrendingUp, title: 'Rentabilité nette nette', desc: 'Calculez votre rendement réel après charges, emprunt et fiscalité.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="font-bold text-lg">ImmoCalc</span>
        <Link href="/login" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Connexion
        </Link>
      </nav>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-6">Investissez mieux, calculez juste.</h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          La plateforme qui intègre charges, emprunt et fiscalité pour une rentabilité vraiment nette.
        </p>
        <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2">
          Commencer gratuitement <ArrowRight size={18} />
        </Link>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="border border-gray-100 rounded-xl p-6">
            <Icon size={20} className="text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
