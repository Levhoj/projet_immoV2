'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { TrendingUp } from 'lucide-react'

const NAV_LINKS = [
  { href: '/recherche', label: 'Recherche' },
  { href: '/outils/calculateur-mensualite', label: 'Outils' },
  { href: '/tarifs', label: 'Tarifs' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center group-hover:bg-sky-400 transition-colors">
            <TrendingUp size={15} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">Rendivo</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
              Connexion
            </Link>
            <Link href="/login" className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
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
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}
