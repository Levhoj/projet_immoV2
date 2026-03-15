import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Calculator, FileSpreadsheet, TrendingUp, ChevronRight, Lock, ArrowUpRight } from 'lucide-react'

const TOOLS = [
  { href: '/recherche', icon: Search, bg: 'bg-sky-50', color: 'text-sky-600', title: 'Recherche immobilière', desc: '900+ sources · Filtres avancés', premium: false },
  { href: '/outils/calculateur-mensualite', icon: Calculator, bg: 'bg-amber-50', color: 'text-amber-600', title: 'Calculateur de mensualité', desc: 'Taux fixe · Assurance incluse', premium: false },
  { href: '/outils/tableau-amortissement', icon: FileSpreadsheet, bg: 'bg-violet-50', color: 'text-violet-600', title: "Tableau d'amortissement", desc: 'Vue mensuelle et annuelle', premium: false },
  { href: '/outils/rentabilite', icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600', title: 'Rentabilité nette nette', desc: '4 régimes fiscaux · Emprunt intégré', premium: true },
]

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')
  const user = await currentUser()
  const isPremium = false
  const firstName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress?.split('@')[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Bonjour {firstName} 👋</h1>
            <p className="text-slate-400 text-sm mt-1">Que voulez-vous faire aujourd'hui ?</p>
          </div>
          {!isPremium && (
            <Link href="/tarifs" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              Passer Premium <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Mes outils</p>
        <div className="grid md:grid-cols-2 gap-4">
          {TOOLS.map(({ href, icon: Icon, bg, color, title, desc, premium }) => {
            const locked = premium && !isPremium
            return (
              <Link key={href} href={locked ? '/tarifs' : href}
                className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-sm transition-all flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
                    {premium && (
                      <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {locked && <Lock size={9} />} Premium
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-500 transition-colors flex-shrink-0" />
              </Link>
            )
          })}
        </div>
        {!isPremium && (
          <div className="mt-8 bg-slate-900 rounded-2xl p-6 flex items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold mb-1">Passez à Rendivo Premium</h3>
              <p className="text-slate-400 text-sm">Débloquez la rentabilité nette nette, les 4 régimes fiscaux et les simulations illimitées.</p>
            </div>
            <Link href="/tarifs" className="flex-shrink-0 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              14 jours gratuits
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
