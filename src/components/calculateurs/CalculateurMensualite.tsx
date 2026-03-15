'use client'

import { useState, useCallback } from 'react'

function calculerMensualite(capital: number, tauxAnnuel: number, dureeAns: number): number {
  const r = tauxAnnuel / 100 / 12
  const n = dureeAns * 12
  if (r === 0) return capital / n
  return (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR') + ' €'
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
  const [focused, setFocused] = useState(false)
  const isInteger = step >= 1
  const displayValue = focused
    ? value
    : isInteger
      ? value.toLocaleString('fr-FR')
      : value.toString().replace('.', ',')
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="text-sm text-slate-500">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type={focused ? 'number' : 'text'}
            id={id}
            value={displayValue}
            min={min}
            max={max}
            step={step}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={e => onChange(parseFloat(e.target.value.replace(',', '.').replace(' ', '')) || 0)}
            className="w-32 text-right text-sm font-semibold text-slate-900 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-sky-400 bg-white"
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

interface MetricProps {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}

function Metric({ label, value, sub, highlight }: MetricProps) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-1 ${highlight ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <span className={`text-xs font-medium uppercase tracking-widest ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</span>
      {sub && <span className={`text-xs ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>{sub}</span>}
    </div>
  )
}

interface BarRowProps {
  label: string
  value: number
  max: number
  color: string
  formatted: string
}

function BarRow({ label, value, max, color, formatted }: BarRowProps) {
  const w = max > 0 ? Math.round(Math.abs(value) / max * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-sm text-slate-500 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${w}%`, background: color }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 w-24 text-right">{formatted}</span>
    </div>
  )
}

export default function CalculateurMensualite() {
  const [montant, setMontant] = useState(200000)
  const [duree, setDuree] = useState(20)
  const [taux, setTaux] = useState(3.5)
  const [assur, setAssur] = useState(0.30)

  const mCredit = calculerMensualite(montant, taux, duree)
  const mAssur = montant * assur / 100 / 12
  const mTotal = mCredit + mAssur
  const mInteret = montant * taux / 100 / 12
  const mCapital = mCredit - mInteret
  const n = duree * 12
  const coutTotal = mTotal * n - montant

  const maxBar = Math.max(mCapital, mInteret, mAssur)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Paramètres */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 mb-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Paramètres</h2>
        <Field label="Montant emprunté" id="montant" value={montant} min={10000} max={2000000} step={1000} sliderMax={1000000} unit="€" onChange={setMontant} />
        <Field label="Durée du prêt" id="duree" value={duree} min={1} max={30} step={1} unit="ans" onChange={setDuree} />
        <Field label="Taux d'intérêt fixe" id="taux" value={taux} min={0.1} max={10} step={0.01} unit="%" onChange={setTaux} />
        <Field label="Taux d'assurance" id="assur" value={assur} min={0} max={2} step={0.01} unit="%" onChange={setAssur} />
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Metric label="Mensualité totale" value={fmt(mTotal)} sub="/ mois" highlight />
        <Metric label="Dont coût" value={fmt(mInteret + mAssur)} sub="intérêts + assurance" />
        <Metric label="Coût total" value={fmtInt(coutTotal)} sub="sur la durée" />
      </div>

      {/* Décomposition */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Composition de la mensualité</h2>
        <div className="flex flex-col gap-4">
          <BarRow label="Capital remboursé" value={mCapital} max={maxBar} color="#2563eb" formatted={fmt(mCapital)} />
          <BarRow label="Intérêts" value={mInteret} max={maxBar} color="#f59e0b" formatted={fmt(mInteret)} />
          <BarRow label="Assurance" value={mAssur} max={maxBar} color="#10b981" formatted={fmt(mAssur)} />
        </div>
        <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm text-slate-400">Taux tout compris</span>
          <span className="text-sm font-semibold text-slate-700">{pct(taux + assur)}</span>
        </div>
      </div>
    </div>
  )
}
