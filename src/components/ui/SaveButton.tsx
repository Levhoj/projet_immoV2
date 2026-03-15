'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'

interface SaveButtonProps {
  uuid: string
  titre: string
  ville: string
  cp: string
  prix: number
  surface: number
  ppm: number
  photo: string
  copro: number
  initialSaved?: boolean
}

export default function SaveButton({
  uuid, titre, ville, cp, prix, surface, ppm, photo, copro, initialSaved = false
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      if (saved) {
        await fetch('/api/saved-properties', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid }),
        })
        setSaved(false)
      } else {
        await fetch('/api/saved-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid, titre, ville, cp, prix, surface, ppm, photo, copro }),
        })
        setSaved(true)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Retirer des favoris" : "Sauvegarder l'annonce"}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
        saved
          ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
      }`}>
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : saved ? (
        <BookmarkCheck size={16} />
      ) : (
        <Bookmark size={16} />
      )}
      {saved ? 'Sauvegardé' : 'Sauvegarder'}
    </button>
  )
}
