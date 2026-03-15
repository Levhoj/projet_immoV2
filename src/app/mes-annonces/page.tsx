import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Maximize2, Home, TrendingUp, Bookmark, Search } from 'lucide-react'
import { getSavedProperties } from '@/lib/supabase'
import type { SavedProperty } from '@/lib/supabase'
import SaveButton from '@/components/ui/SaveButton'

function SavedCard({ property }: { property: SavedProperty }) {
  const simulParams = new URLSearchParams()
  if (property.prix) simulParams.set('prix', String(property.prix))
  if (property.surface) simulParams.set('surface', String(property.surface))
  if (property.copro) simulParams.set('copro', String(property.copro))
  if (property.titre) simulParams.set('titre', property.titre)
  if (property.ville) simulParams.set('ville', property.ville)
  if (property.cp) simulParams.set('cp', property.cp)
  if (property.ppm) simulParams.set('ppm', String(property.ppm))
  if (property.photo) simulParams.set('photo', property.photo)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-sm transition-all group">
      {/* Photo */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {property.photo ? (
          <img src={property.photo} alt={property.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home size={32} className="text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <SaveButton
            uuid={property.uuid}
            titre={property.titre}
            ville={property.ville}
            cp={property.cp}
            prix={property.prix}
            surface={property.surface}
            ppm={property.ppm}
            photo={property.photo}
            copro={property.copro}
            initialSaved={true}
          />
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <Link href={`/annonce/${property.uuid}`}>
          <h3 className="font-semibold text-slate-900 text-sm mb-1 hover:text-sky-600 transition-colors truncate">
            {property.titre}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
          <MapPin size={11} />
          <span>{property.ville} {property.cp && `(${property.cp})`}</span>
        </div>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {property.surface > 0 && (
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Maximize2 size={10} /> {property.surface} m²
            </span>
          )}
          {property.ppm > 0 && (
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
              {property.ppm.toLocaleString('fr-FR')} €/m²
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-extrabold text-slate-900">
            {property.prix > 0 ? property.prix.toLocaleString('fr-FR') + ' €' : 'Prix NC'}
          </div>
          <Link
            href={`/annonce/${property.uuid}/simuler?${simulParams.toString()}`}
            className="flex items-center gap-1.5 text-xs font-semibold bg-sky-50 text-sky-600 hover:bg-sky-100 px-3 py-2 rounded-xl transition-colors border border-sky-200">
            <TrendingUp size={12} /> Simuler
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function MesAnnoncesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  const savedProperties = await getSavedProperties(userId)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bookmark size={16} className="text-sky-400" />
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">Mes favoris</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Annonces sauvegardées</h1>
            <p className="text-slate-400 text-sm mt-1">
              {savedProperties.length} annonce{savedProperties.length > 1 ? 's' : ''} sauvegardée{savedProperties.length > 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/recherche"
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Search size={14} /> Rechercher
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {savedProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Bookmark size={28} className="text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">Aucune annonce sauvegardée</h2>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              Parcourez les annonces et cliquez sur "Sauvegarder" pour les retrouver ici.
            </p>
            <Link href="/recherche"
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
              <Search size={15} /> Lancer une recherche
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedProperties.map(p => <SavedCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
