/**
 * Utilitaires partagés entre tous les composants.
 */
import { clsx, type ClassValue } from 'clsx'

/** Fusionne des classes Tailwind conditionnellement */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Calcule la mensualité d'un prêt à taux fixe (formule PMT).
 * @param capital    Montant emprunté en €
 * @param tauxAnnuel Taux d'intérêt annuel en %
 * @param dureeAns   Durée en années
 */
export function calculerMensualite(
  capital: number,
  tauxAnnuel: number,
  dureeAns: number
): number {
  const r = tauxAnnuel / 100 / 12
  const n = dureeAns * 12
  if (r === 0) return capital / n
  return (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

/** Formate un nombre en euros (arrondi à l'entier) */
export function formatEuros(n: number): string {
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}

/** Formate un nombre en euros avec signe + ou - */
export function formatEurosSign(n: number): string {
  return (n >= 0 ? '+' : '') + Math.round(n).toLocaleString('fr-FR') + ' €'
}

/** Formate un pourcentage avec 2 décimales */
export function formatPct(n: number, decimals = 2): string {
  return n.toFixed(decimals).replace('.', ',') + ' %'
}

/**
 * Génère le tableau d'amortissement complet.
 * Retourne une ligne par mois.
 */
export function genererTableauAmortissement(
  capital: number,
  tauxAnnuel: number,
  tauxAssurance: number,
  dureeAns: number
) {
  const r     = tauxAnnuel / 100 / 12
  const n     = Math.round(dureeAns * 12)
  const mCred = calculerMensualite(capital, tauxAnnuel, dureeAns)
  const mAss  = (capital * tauxAssurance) / 100 / 12
  const mTot  = mCred + mAss

  const rows = []
  let solde = capital

  for (let i = 1; i <= n; i++) {
    const interet  = solde * r
    const capitalR = mCred - interet
    solde = Math.max(0, solde - capitalR)
    rows.push({
      mois:       i,
      mensualite: mTot,
      capital:    capitalR,
      interet,
      assurance:  mAss,
      solde,
    })
  }

  return rows
}
