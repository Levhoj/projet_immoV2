import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/layout/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Rendivo — Investissement immobilier intelligent',
  description: 'Trouvez les meilleurs investissements immobiliers. Agrégateur d\'annonces + simulateur de rentabilité nette nette.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/login"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="fr">
        <body className={`${inter.variable} bg-dark-50`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
