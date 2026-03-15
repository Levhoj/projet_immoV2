'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { TrendingUp, Calculator, FileSpreadsheet, ChevronDown, Lock } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const OUTILS = [
  {
    href: '/outils/calculateur-mensualite',
    icon: Calculator,
    label: 'Calculateur de mensualité',
    desc: 'Taux fixe · Assurance incluse',
    premium: false,
  },
  {
    href: '/outils/tableau-amortissement',
    icon: FileSpreadsheet,
    label: "Tableau d'amortissement",
    desc: 'Vue mensuelle et annuelle',
    premium: false,
  },
  {
    href: '/outils/rentabilite',
    icon: TrendingUp,
    label: 'Rentabilité nette nette',
    desc: '4 régimes fiscaux · Emprunt intégré',
    premium: true,
  },
]

const NAV_LINKS_PUBLIC = [
  { href: '/recherche', label: 'Recherche' },
  { href: '/tarifs', label: 'Tarifs' },
]

const NAV_LINKS_AUTH = [
  { href: '/recherche', label: 'Recherche' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [outilsOpen, setOutilsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOutilsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isOutilsActive = pathname.startsWith('/outils')

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center group-hover:bg-sky-400 transition-colors">
            <TrendingUp size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">Rendivo</span>
        </Link>

        {/* Liens nav */}
        <div className="hidden md:flex items-center gap-1">

          {/* Liens selon état auth */}
          <SignedOut>
            {NAV_LINKS_PUBLIC.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-white bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                {link.label}
              </Link>
            ))}
          </SignedOut>

          <SignedIn>
            {NAV_LINKS_AUTH.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-white bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                {link.label}
              </Link>
            ))}
          </SignedIn>

          {/* Menu déroulant Outils */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOutilsOpen(o => !o)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isOutilsActive
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              Outils
              <ChevronDown size={14} className={`transition-transform duration-200 ${outilsOpen ? 'rotate-180' : ''}`} />
            </button>

            {outilsOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                <div className="p-1.5">
                  {OUTILS.map(({ href, icon: Icon, label, desc, premium }) => (
                    <Link key={href} href={href}
                      onClick={() => setOutilsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${premium ? 'bg-amber-50' : 'bg-sky-50'}`}>
                        <Icon size={17} className={premium ? 'text-amber-500' : 'text-sky-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">{label}</span>
                          {premium && (
                            <span className="flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                              <Lock size={9} /> Premium
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                  <p className="text-xs text-slate-400">
                    La rentabilité nette nette est disponible avec le plan <Link href="/tarifs" onClick={() => setOutilsOpen(false)} className="text-sky-500 font-semibold hover:underline">Premium</Link>.
  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
              Connexion
            </Link>
            <Link href="/signup" className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Commencer
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/dashboard' ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }}>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Tarifs & abonnement"
                  labelIcon={<TrendingUp size={14} />}
                  href="/tarifs"
                />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>

      </div>
    </nav>
  )
}
