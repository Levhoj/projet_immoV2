import CalculateurMensualite from '@/components/calculateurs/CalculateurMensualite.tsx'

export default function CalculateurMensualitePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Calculateur de mensualité</h1>
          <p className="text-slate-500">Taux fixe · Assurance incluse · Résultats en temps réel</p>
        </div>
        <CalculateurMensualite />
      </div>
    </div>
  )
}
