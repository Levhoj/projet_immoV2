'use client'

import { useState, useMemo } from 'react'

function calculerMensualite(capital: number, tauxAnnuel: number, dureeAns: number): number {
  const r = tauxAnnuel / 100 / 12
  const n = dureeAns * 12
  if (r === 0) return capital / n
  return (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}

function fmtD(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

interface FieldProps {
  label: string
  id: string
  value: number
  min: number
  max: number
  step: number
  sliderMax?: number
  unit?: string
  onChange: (v: number) => void
}

function Field({ label, id, value, min, max, step, sliderMax, unit, onChange }: FieldProps) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="text-sm text-slate-500">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            id={id}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            className="w-28 text-right text-sm font-semibold text-slate-900 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-sky-400 bg-white"
          />
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={sliderMax ?? max}
        step={step}
        value={Math.min(value, sliderMax ?? max)}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-sky-500 h-1.5 rounded-full"
      />
    </div>
  )
}

interface Row {
  periode: string
  mensualite: number
  capital: number
  interet: number
  assurance: number
  solde: number
  pct: number
}

export default function TableauAmortissement() {
  const [montant, setMontant] = useState(200000)
  const [duree, setDuree] = useState(20)
  const [taux, setTaux] = useState(3.5)
  const [assur, setAssur] = useState(0.30)
  const [vue, setVue] = useState<'mensuel' | 'annuel'>('annuel')

  const { rows, totaux, mTotale } = useMemo(() => {
    const r = taux / 100 / 12
    const n = Math.round(duree * 12)
    const mCredit = calculerMensualite(montant, taux, duree)
    const mAss = montant * assur / 100 / 12
    const mTot = mCredit + mAss

    const moisRows: Row[] = []
    let solde = montant

    for (let i = 1; i <= n; i++) {
      const interet = solde * r
      const capital = mCredit - interet
      solde = Math.max(0, solde - capital)
      moisRows.push({
        periode: `Mois ${i}`,
        mensualite: mTot,
        capital,
        interet,
        assurance: mAss,
        solde,
        pct: montant > 0 ? Math.round((montant - solde) / montant * 100) : 100,
      })
    }

    const annRows: Row[] = []
    for (let an = 1; an <= duree; an++) {
      const slice = moisRows.slice((an - 1) * 12, an * 12)
      annRows.push({
        periode: `Année ${an}`,
        mensualite: slice.reduce((s, r) => s + r.mensualite, 0),
        capital: slice.reduce((s, r) => s + r.capital, 0),
        interet: slice.reduce((s, r) => s + r.interet, 0),
        assurance: slice.reduce((s, r) => s + r.assurance, 0),
        solde: slice[slice.length - 1]?.solde ?? 0,
        pct: slice[slice.length - 1]?.pct ?? 100,
      })
    }

    const totaux = {
      mensualite: mTot * n,
      capital: montant,
      interet: moisRows.reduce((s, r) => s + r.interet, 0),
      assurance: moisRows.reduce((s, r) => s + r.assurance, 0),
    }

    return { rows: vue === 'mensuel' ? moisRows : annRows, totaux, mTotale: mTot }
  }, [montant, duree, taux, assur, vue])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Paramètres */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Paramètres</h2>
        <div className="grid md:grid-cols-2 gap-x-10">
          <Field label="Montant emprunté" id="montant" value={montant} min={10000} max={2000000} step={1000} sliderMax={1000000} unit="€" onChange={setMontant} />
          <Field label="Durée du prêt" id="duree" value={duree} min={1} max={30} step={1} unit="ans" onChange={setDuree} />
          <Field label="Taux d'intérêt fixe" id="taux" value={taux} min={0.1} max={10} step={0.01} unit="%" onChange={setTaux} />
          <Field label="Taux d'assurance" id="assur" value={assur} min={0} max={2} step={0.01} unit="%" onChange={setAssur} />
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Mensualité totale', value: fmtD(mTotale), sub: 'par mois', highlight: true },
          { label: 'Total intérêts', value: fmt(totaux.interet), sub: 'sur la durée' },
          { label: 'Total assurance', value: fmt(totaux.assurance), sub: 'sur la durée' },
          { label: 'Coût total crédit', value: fmt(totaux.interet + totaux.assurance), sub: 'hors capital' },
        ].map(({ label, value, sub, highlight }) => (
          <div key={label} className={`rounded-2xl p-4 ${highlight ? 'bg-sky-500' : 'bg-slate-50 border border-slate-200'}`}>
            <div className={`text-xs font-semibold uppercase tracking-widest mb-1 ${highlight ? 'text-sky-100' : 'text-slate-400'}`}>{label}</div>
            <div className={`text-lg font-extrabold ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</div>
            <div className={`text-xs mt-0.5 ${highlight ? 'text-sky-200' : 'text-slate-400'}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Toggle vue */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tableau d'amortissement</h2>
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            {(['annuel', 'mensuel'] as const).map(v => (
              <button key={v} onClick={() => setVue(v)}
                className={`px-4 py-1.5 text-xs font-semibold transition-colors capitalize ${vue === v ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                {v === 'annuel' ? 'Annuel' : 'Mensuel'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Période</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{vue === 'annuel' ? 'Total annuel' : 'Mensualité'}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-sky-400 uppercase tracking-wider">Capital</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">Intérêts</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider">Assurance</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Solde restant</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Remboursé</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.periode} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                  <td className="px-4 py-2.5 font-medium text-slate-600 text-xs">{row.periode}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{fmtD(row.mensualite)}</td>
                  <td className="px-4 py-2.5 text-right text-sky-600 font-medium">{fmtD(row.capital)}</td>
                  <td className="px-4 py-2.5 text-right text-amber-600 font-medium">{fmtD(row.interet)}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{fmtD(row.assurance)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{fmt(row.solde)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 bg-sky-500 rounded-full transition-all" style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">{row.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-4 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider">Total</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">{fmt(totaux.mensualite)}</td>
                <td className="px-4 py-3 text-right font-bold text-sky-600">{fmt(totaux.capital)}</td>
                <td className="px-4 py-3 text-right font-bold text-amber-600">{fmt(totaux.interet)}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmt(totaux.assurance)}</td>
                <td className="px-4 py-3 text-right text-slate-400">—</td>
                <td className="px-4 py-3 text-right font-bold text-slate-600">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
