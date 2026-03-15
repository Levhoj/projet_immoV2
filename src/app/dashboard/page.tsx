/**
 * Dashboard principal — accessible uniquement après connexion.
 * La protection est gérée par le middleware Clerk (src/middleware.ts).
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calculator, FileSpreadsheet, TrendingUp, ChevronRight, Lock } from 'lucide-react'

const TOOLS = [
  {
    href: '/outils/calculateur-mensualite',
    icon: Calculator,
    title: 'Calculateur de mensualité',
    desc: 'Taux fixe · Assurance incluse',
    premium: false,
  },
  {
    href: '/outils/tableau-amortissement',
    icon: FileSpreadsheet,
    title: "Tableau d'amortissement",
    desc: 'Vue mensuelle et annuelle',
    premium: false,
  },
  {
    href: '/outils/rentabilite',
    icon: TrendingUp,
    title: 'Rentabilité nette nette',
    desc: '4 régimes fiscaux · Emprunt intégré',
    premium: true,
  },
]

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const user = await currentUser()
  // TODO: vérifier le statut premium via Supabase ou Clerk metadata
  const isPremium = false

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-slate-900">ImmoCalc</span>
          <div className="flex items-center gap-4">
            {!isPremium && (
              <Link
                href="/tarifs"
                className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                Passer Premium
              </Link>
            )}
            <span className="text-sm text-slate-500">
              {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Mes outils</h1>
        <p className="text-slate-500 mb-10">Sélectionnez un simulateur pour commencer.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {TOOLS.map(({ href, icon: Icon, title, desc, premium }) => {
            const locked = premium && !isPremium
            return (
              <Link
                key={href}
                href={locked ? '/tarifs' : href}
                className="group border border-slate-200 hover:border-brand-500 bg-white rounded-xl p-6 transition-all hover:shadow-md flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-brand-600" />
                  </div>
                  {premium && !isPremium && (
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      <Lock size={10} /> Premium
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 mb-1">{title}</h2>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
                <div className="flex items-center text-brand-600 text-sm font-medium mt-auto gap-1 group-hover:gap-2 transition-all">
                  {locked ? 'Débloquer' : 'Ouvrir'} <ChevronRight size={16} />
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
