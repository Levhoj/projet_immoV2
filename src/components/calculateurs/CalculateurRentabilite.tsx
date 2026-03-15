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

function fmtSign(n: number): string {
  return (n >= 0 ? '+' : '') + Math.round(n).toLocaleString('fr-FR') + ' €'
}

function pct(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' %'
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

const REGIMES = [
  { key: 'micro-foncier', label: 'Micro-foncier', sub: 'Abattement 30%', desc: 'Location nue. Abattement forfaitaire de 30% sur les loyers. Plafonné à 15 000 € de revenus fonciers/an.' },
  { key: 'reel', label: 'Réel foncier', sub: 'Déduction charges', desc: 'Location nue. Déduction des charges réelles + intérêts d\'emprunt. Recommandé si charges > 30% des loyers.' },
  { key: 'micro-bic', label: 'LMNP micro-BIC', sub: 'Abattement 50%', desc: 'Location meublée. Abattement forfaitaire de 50% sur les recettes. Plafonné à 77 700 € de recettes/an.' },
  { key: 'lmnp-reel', label: 'LMNP réel', sub: 'Amortissements', desc: 'Location meublée. Déduction charges + amortissement du bien. Permet souvent d\'annuler l\'impôt.' },
] as const

type Regime = typeof REGIMES[number]['key']

interface WaterfallRow {
  label: string
  value: number
  color: string
  isTotal?: boolean
}

function WaterfallRow({ row, max }: { row: WaterfallRow; max: number }) {
  const w = max > 0 ? Math.round(Math.abs(row.value) / max * 100) : 0
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 ${row.isTotal ? 'bg-slate-50 font-semibold border-t border-slate-200' : 'border-t border-slate-50'}`}>
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
      <span className={`flex-1 text-sm ${row.isTotal ? 'text-slate-800' : 'text-slate-500'}`}>{row.label}</span>
      {!row.isTotal && (
        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden flex-shrink-0">
          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${w}%`, background: row.color }} />
        </div>
      )}
      {row.isTotal && <div className="w-24 flex-shrink-0" />}
      <span className={`text-sm w-28 text-right flex-shrink-0 ${row.value >= 0 ? 'text-emerald-600' : 'text-red-500'} ${row.isTotal ? 'font-bold' : 'font-medium'}`}>
        {fmtSign(row.value)}
      </span>
    </div>
  )
}

export interface RentabiliteInitialValues {
  prix?: number
  copro?: number
  surface?: number
  notaire?: number
}

export default function CalculateurRentabilite({ initial }: { initial?: RentabiliteInitialValues }) {
  // Acquisition
  const [prix, setPrix] = useState(initial?.prix ?? 200000)
  const [notaire, setNotaire] = useState(initial?.notaire ?? 16000)
  const [travauxAchat, setTravauxAchat] = useState(5000)
  const [apport, setApport] = useState(40000)

  // Emprunt
  const [emprunt, setEmprunt] = useState(181000)
  const [duree, setDuree] = useState(20)
  const [taux, setTaux] = useState(3.5)
  const [assur, setAssur] = useState(0.3)

  // Revenus
  const [loyer, setLoyer] = useState(900)
  const [vacance, setVacance] = useState(0.5)

  // Charges
  const [tf, setTf] = useState(1200)
  const [copro, setCopro] = useState(initial?.copro ?? 1000)
  const [gestion, setGestion] = useState(7)
  const [travaux, setTravaux] = useState(500)

  // Fiscalité
  const [regime, setRegime] = useState<Regime>('micro-foncier')
  const [tmi, setTmi] = useState(30)
  const [ps, setPs] = useState(17.2)

  // LMNP réel
  const [amortImm, setAmortImm] = useState(30)
  const [amortPct, setAmortPct] = useState(80)
  const [amortTrv, setAmortTrv] = useState(10)
  const [amortMob, setAmortMob] = useState(500)

  const calc = useMemo(() => {
    const prixTotal = prix + notaire + travauxAchat
    const loyersAn = loyer * (12 - vacance)
    const gestionAn = loyersAn * gestion / 100
    const chargesAn = tf + copro + gestionAn + travaux
    const revenuNet = loyersAn - chargesAn

    const mCredit = calculerMensualite(emprunt, taux, duree)
    const mAssurMens = emprunt * assur / 100 / 12
    const mTotale = mCredit + mAssurMens
    const annuiteAn = mTotale * 12
    const interetsAn = emprunt * taux / 100
    const assurAn = mAssurMens * 12
    const capitalRembAn = annuiteAn - interetsAn - assurAn

    let baseImpo = 0, fiscalite = 0, amortTotal = 0

    if (regime === 'micro-foncier') {
      baseImpo = loyersAn * 0.70
      fiscalite = baseImpo * (tmi + ps) / 100
    } else if (regime === 'reel') {
      const deductibles = chargesAn + interetsAn + assurAn
      baseImpo = Math.max(0, loyersAn - deductibles)
      fiscalite = baseImpo * (tmi + ps) / 100
    } else if (regime === 'micro-bic') {
      baseImpo = loyersAn * 0.50
      fiscalite = baseImpo * (tmi + ps) / 100
    } else if (regime === 'lmnp-reel') {
      amortTotal = (prix * amortPct / 100) / amortImm + travauxAchat / amortTrv + amortMob
      const deductibles = chargesAn + interetsAn + assurAn + amortTotal
      baseImpo = Math.max(0, loyersAn - deductibles)
      fiscalite = baseImpo * (tmi + ps) / 100
    }

    const revenuNN = revenuNet - fiscalite
    const cashFlowAn = revenuNN - annuiteAn
    const cashFlowMens = cashFlowAn / 12

    const rBrut = prixTotal > 0 ? loyersAn / prixTotal * 100 : 0
    const rNet  = prixTotal > 0 ? revenuNet / prixTotal * 100 : 0
    const rNN   = prixTotal > 0 ? revenuNN / prixTotal * 100 : 0

    // Comparaison des 4 régimes
    const compare = REGIMES.map(r => {
      let bi = 0, fisc = 0
      const rKey = r.key
      if (rKey === 'micro-foncier') { bi = loyersAn * 0.70; fisc = bi * (tmi + ps) / 100 }
      else if (rKey === 'reel') { bi = Math.max(0, loyersAn - chargesAn - interetsAn - assurAn); fisc = bi * (tmi + ps) / 100 }
      else if (rKey === 'micro-bic') { bi = loyersAn * 0.50; fisc = bi * (tmi + ps) / 100 }
      else if (rKey === 'lmnp-reel') {
        const at = (prix * amortPct / 100) / amortImm + travauxAchat / amortTrv + amortMob
        bi = Math.max(0, loyersAn - chargesAn - interetsAn - assurAn - at)
        fisc = bi * (tmi + ps) / 100
      }
      const rnn = prixTotal > 0 ? (revenuNet - fisc) / prixTotal * 100 : 0
      const cf = (revenuNet - fisc - annuiteAn) / 12
      return { key: rKey, label: r.label, rnn, cf, fiscalite: fisc }
    })
    const bestRnn = Math.max(...compare.map(c => c.rnn))

    // Waterfall
    const wfRows: WaterfallRow[] = [
      { label: 'Loyers perçus', value: loyersAn, color: '#10B981' },
      { label: 'Taxe foncière', value: -tf, color: '#F59E0B' },
      { label: 'Charges de copropriété', value: -copro, color: '#F59E0B' },
      { label: `Frais de gestion (${gestion}%)`, value: -gestionAn, color: '#F59E0B' },
      { label: 'Travaux / entretien', value: -travaux, color: '#F59E0B' },
      { label: 'Revenu net de charges', value: revenuNet, color: '#0EA5E9', isTotal: true },
    ]

    if (regime === 'micro-foncier') {
      wfRows.push({ label: 'Abattement micro-foncier (30%)', value: -(loyersAn * 0.30), color: '#94A3B8' })
    } else if (regime === 'reel') {
      wfRows.push({ label: 'Déduction intérêts + assurance', value: -(interetsAn + assurAn), color: '#94A3B8' })
    } else if (regime === 'micro-bic') {
      wfRows.push({ label: 'Abattement micro-BIC (50%)', value: -(loyersAn * 0.50), color: '#94A3B8' })
    } else if (regime === 'lmnp-reel') {
      wfRows.push({ label: 'Déduction intérêts + assurance', value: -(interetsAn + assurAn), color: '#94A3B8' })
      wfRows.push({ label: 'Amortissements', value: -amortTotal, color: '#8B5CF6' })
    }

    wfRows.push(
      { label: `Impôt (${tmi}%) + PS (${ps}%)`, value: -fiscalite, color: '#EF4444' },
      { label: 'Revenu net net', value: revenuNN, color: '#0EA5E9', isTotal: true },
      { label: 'Capital remboursé', value: -capitalRembAn, color: '#94A3B8' },
      { label: 'Intérêts emprunt', value: -interetsAn, color: '#F97316' },
      { label: 'Assurance emprunt', value: -assurAn, color: '#F97316' },
      { label: 'Cash-flow annuel net', value: cashFlowAn, color: cashFlowAn >= 0 ? '#10B981' : '#EF4444', isTotal: true },
    )

    const maxAbs = Math.max(...wfRows.map(r => Math.abs(r.value)))

    return {
      prixTotal, loyersAn, gestionAn, chargesAn, revenuNet,
      baseImpo, fiscalite, revenuNN, mTotale, annuiteAn,
      interetsAn, assurAn, capitalRembAn, cashFlowAn, cashFlowMens,
      rBrut, rNet, rNN, compare, bestRnn, wfRows, maxAbs,
    }
  }, [prix, notaire, travauxAchat, apport, emprunt, duree, taux, assur, loyer, vacance, tf, copro, gestion, travaux, regime, tmi, ps, amortImm, amortPct, amortTrv, amortMob])

  const cfColor = calc.cashFlowMens >= 0 ? 'bg-emerald-500' : 'bg-red-500'
  const cfTextColor = calc.cashFlowMens >= 0 ? 'text-emerald-600' : 'text-red-500'

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Acquisition + Emprunt */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Acquisition</h2>
          <Field label="Prix d'achat" id="prix" value={prix} min={10000} max={2000000} step={1000} sliderMax={1000000} unit="€" onChange={setPrix} />
          <Field label="Frais de notaire" id="notaire" value={notaire} min={0} max={100000} step={500} unit="€" onChange={setNotaire} />
          <Field label="Travaux à l'achat" id="travauxAchat" value={travauxAchat} min={0} max={200000} step={500} unit="€" onChange={setTravauxAchat} />
          <Field label="Apport personnel" id="apport" value={apport} min={0} max={500000} step={1000} unit="€" onChange={setApport} />
          <div className="mt-2 pt-3 border-t border-slate-100 flex justify-between text-sm">
            <span className="text-slate-400">Prix de revient total</span>
            <span className="font-bold text-slate-900">{fmt(calc.prixTotal)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Emprunt</h2>
          <Field label="Montant emprunté" id="emprunt" value={emprunt} min={0} max={2000000} step={1000} sliderMax={1000000} unit="€" onChange={setEmprunt} />
          <Field label="Durée" id="duree" value={duree} min={1} max={30} step={1} unit="ans" onChange={setDuree} />
          <Field label="Taux d'intérêt fixe" id="taux" value={taux} min={0.1} max={10} step={0.01} unit="%" onChange={setTaux} />
          <Field label="Taux d'assurance" id="assur" value={assur} min={0} max={2} step={0.01} unit="%" onChange={setAssur} />
          <div className="mt-2 pt-3 border-t border-slate-100 flex justify-between text-sm">
            <span className="text-slate-400">Mensualité crédit</span>
            <span className="font-bold text-slate-900">{fmt(calc.mTotale)} / mois</span>
          </div>
        </div>
      </div>

      {/* Revenus + Charges */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Revenus locatifs</h2>
          <Field label="Loyer mensuel HC" id="loyer" value={loyer} min={0} max={5000} step={50} unit="€" onChange={setLoyer} />
          <Field label="Vacance locative" id="vacance" value={vacance} min={0} max={6} step={0.5} unit="mois/an" onChange={setVacance} />
          <div className="mt-2 pt-3 border-t border-slate-100 flex justify-between text-sm">
            <span className="text-slate-400">Loyers annuels nets</span>
            <span className="font-bold text-slate-900">{fmt(calc.loyersAn)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Charges annuelles</h2>
          <Field label="Taxe foncière" id="tf" value={tf} min={0} max={10000} step={100} unit="€" onChange={setTf} />
          <Field label="Charges copropriété" id="copro" value={copro} min={0} max={10000} step={100} unit="€" onChange={setCopro} />
          <Field label="Frais de gestion" id="gestion" value={gestion} min={0} max={20} step={0.5} unit="%" onChange={setGestion} />
          <Field label="Travaux / entretien" id="travaux" value={travaux} min={0} max={20000} step={100} unit="€" onChange={setTravaux} />
        </div>
      </div>

      {/* Fiscalité */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Régime fiscal</h2>

        {/* Sélecteur régime */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {REGIMES.map(r => (
            <button key={r.key} onClick={() => setRegime(r.key)}
              className={`p-3 rounded-xl border text-left transition-all ${regime === r.key ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`text-sm font-semibold mb-0.5 ${regime === r.key ? 'text-sky-700' : 'text-slate-800'}`}>{r.label}</div>
              <div className={`text-xs ${regime === r.key ? 'text-sky-500' : 'text-slate-400'}`}>{r.sub}</div>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-5 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed">
          {REGIMES.find(r => r.key === regime)?.desc}
        </p>

        <div className="grid md:grid-cols-2 gap-x-10">
          <Field label="Tranche marginale d'imposition" id="tmi" value={tmi} min={0} max={45} step={1} unit="%" onChange={setTmi} />
          <Field label="Prélèvements sociaux" id="ps" value={ps} min={0} max={20} step={0.1} unit="%" onChange={setPs} />
        </div>

        {regime === 'lmnp-reel' && (
          <div className="border-t border-slate-100 pt-5 mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Paramètres d'amortissement</p>
            <div className="grid md:grid-cols-2 gap-x-10">
              <Field label="Durée amortissement immeuble" id="amortImm" value={amortImm} min={10} max={50} step={1} unit="ans" onChange={setAmortImm} />
              <Field label="Part amortissable du bien" id="amortPct" value={amortPct} min={50} max={95} step={1} unit="%" onChange={setAmortPct} />
              <Field label="Durée amortissement travaux" id="amortTrv" value={amortTrv} min={3} max={20} step={1} unit="ans" onChange={setAmortTrv} />
              <Field label="Amortissement mobilier" id="amortMob" value={amortMob} min={0} max={5000} step={100} unit="€/an" onChange={setAmortMob} />
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Rendement brut</div>
          <div className="text-xl font-extrabold text-slate-900">{pct(calc.rBrut)}</div>
          <div className="text-xs text-slate-400 mt-0.5">loyers / prix total</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Net de charges</div>
          <div className="text-xl font-extrabold text-slate-900">{pct(calc.rNet)}</div>
          <div className="text-xs text-slate-400 mt-0.5">hors fiscalité</div>
        </div>
        <div className="bg-sky-500 rounded-2xl p-4">
          <div className="text-xs font-semibold text-sky-100 uppercase tracking-widest mb-1">Net net</div>
          <div className="text-xl font-extrabold text-white">{pct(calc.rNN)}</div>
          <div className="text-xs text-sky-200 mt-0.5">après fiscalité</div>
        </div>
        <div className={`${cfColor} rounded-2xl p-4`}>
          <div className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-1">Cash-flow</div>
          <div className="text-xl font-extrabold text-white">{fmtSign(calc.cashFlowMens)}</div>
          <div className="text-xs text-white/70 mt-0.5">par mois</div>
        </div>
      </div>

      {/* Comparaison régimes */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Comparaison des 4 régimes</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {calc.compare.map((c, i) => {
            const isBest = Math.abs(c.rnn - calc.bestRnn) < 0.001
            const isCurrent = c.key === regime
            return (
              <button key={c.key} onClick={() => setRegime(c.key as Regime)}
                className={`p-4 text-left transition-colors border-r border-slate-100 last:border-r-0 hover:bg-slate-50 ${isCurrent ? 'bg-sky-50' : ''}`}>
                {isBest && (
                  <span className="inline-block text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mb-2">Meilleur</span>
                )}
                <div className={`text-xs font-semibold mb-1 ${isCurrent ? 'text-sky-600' : 'text-slate-500'}`}>{c.label}</div>
                <div className={`text-lg font-extrabold ${isCurrent ? 'text-sky-700' : 'text-slate-900'}`}>{pct(c.rnn)}</div>
                <div className={`text-xs mt-0.5 font-medium ${c.cf >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtSign(c.cf)}/mois</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cascade waterfall */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cascade annuelle</h2>
        </div>
        <div>
          {calc.wfRows.map((row, i) => (
            <WaterfallRow key={i} row={row} max={calc.maxAbs} />
          ))}
        </div>
      </div>

      {/* Message synthèse */}
      <div className={`rounded-2xl p-5 text-sm leading-relaxed ${calc.cashFlowMens >= 50 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : calc.cashFlowMens >= -200 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
        {calc.cashFlowMens >= 50
          ? `Projet auto-financé avec un cash-flow positif de ${fmtSign(calc.cashFlowMens)}/mois. Rendement net net : ${pct(calc.rNN)} sur ${fmt(calc.prixTotal)} investis.`
          : calc.cashFlowMens >= -200
          ? `Cash-flow légèrement négatif (${fmtSign(calc.cashFlowMens)}/mois). Projet quasi-équilibré — rendement net net : ${pct(calc.rNN)}.`
          : `Cash-flow négatif de ${fmtSign(calc.cashFlowMens)}/mois. Vérifiez le loyer, les charges ou les conditions de l'emprunt.`
        }
      </div>

    </div>
  )
}
