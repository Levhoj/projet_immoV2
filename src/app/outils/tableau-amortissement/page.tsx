import TableauAmortissement from '@/components/calculateurs/TableauAmortissement'

export default function TableauAmortissementPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Tableau d'amortissement</h1>
          <p className="text-slate-500">Taux fixe · Assurance incluse · Vue mensuelle ou annuelle</p>
        </div>
        <TableauAmortissement />
      </div>
    </div>
  )
}
