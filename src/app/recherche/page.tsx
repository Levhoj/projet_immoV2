'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, MapPin, Home, Euro, Maximize2, ChevronLeft, ChevronRight, ExternalLink, Calculator, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Location {
  id: number
  name: string
  zipcode?: string
  department?: { code: string; name: string }
  type: string
}

interface Advert {
  price: number
  surface: number
  url: string
  pictures: string[]
  picturesRemote: string[]
  publisher: { name: string; category: string }
  description: string
  title: string
  contact?: { agency?: string; phone?: string }
  energy?: { category: string }
  features?: string[]
  createdAt: string
  events?: { fieldName: string; percentVariation: number; fieldNewValue: string }[]
}

interface Property {
  uuid: string
  title: string
  price: number
  surface: number
  room: number
  bedroom: number
  propertyType: number
  transactionType: number
  city: { name: string; zipcode: string; department: { name: string } }
  locations: { lat: number; lon: number }
  pictures: string[]
  adverts: Advert[]
  pricePerMeter: number
  createdAt: string
  expired: boolean
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { label: 'Appartement', value: '0' },
  { label: 'Maison', value: '1' },
  { label: 'Immeuble', value: '2' },
  { label: 'Terrain', value: '5' },
]

const TRANSACTION_TYPES = [
  { label: 'Achat', value: '0' },
  { label: 'Location', value: '1' },
]

// ─── Composants utilitaires ───────────────────────────────────────────────────

function Badge({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {children}
    </span>
  )
}

function EnergyBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    A: 'bg-green-600 text-white', B: 'bg-green-400 text-white',
    C: 'bg-lime-400 text-white', D: 'bg-yellow-400 text-slate-900',
    E: 'bg-orange-400 text-white', F: 'bg-red-400 text-white',
    G: 'bg-red-600 text-white',
  }
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${colors[category] ?? 'bg-slate-200 text-slate-600'}`}>
      {category}
    </span>
  )
}

// ─── Carte annonce ────────────────────────────────────────────────────────────

function PropertyCard({ property }: { property: Property }) {
  const advert = property.adverts?.[0]
  const pics = advert?.pictures?.length ? advert.pictures : advert?.picturesRemote ?? []
  const pic = pics[0] ?? null
  const hasPriceDrop = advert?.events?.some(e => e.fieldName === 'price' && e.percentVariation < 0)
  const priceDrop = advert?.events?.find(e => e.fieldName === 'price' && e.percentVariation < 0)

  const typeLabels: Record<number, string> = { 0: 'Appartement', 1: 'Maison', 2: 'Immeuble', 3: 'Parking', 4: 'Bureau', 5: 'Terrain', 6: 'Commerce' }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
      {/* Image */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {pic ? (
          <img src={pic} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home size={32} className="text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge color="blue">{typeLabels[property.propertyType] ?? 'Bien'}</Badge>
          {hasPriceDrop && (
            <Badge color="green">↓ {Math.abs(priceDrop!.percentVariation).toFixed(1)}%</Badge>
          )}
        </div>
        {advert?.energy?.category && (
          <div className="absolute top-3 right-3">
            <EnergyBadge category={advert.energy.category} />
          </div>
        )}
        {advert?.publisher && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-xs text-slate-600 px-2 py-1 rounded-lg">
            {advert.publisher.name}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1">{property.title}</h3>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
          <MapPin size={12} />
          <span>{property.city.name} ({property.city.zipcode})</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          {property.surface > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Maximize2 size={12} /> {property.surface} m²
            </span>
          )}
          {property.room > 0 && (
            <span className="text-xs text-slate-500">{property.room} pièce{property.room > 1 ? 's' : ''}</span>
          )}
          {property.bedroom > 0 && (
            <span className="text-xs text-slate-500">{property.bedroom} ch.</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">
              {property.price > 0 ? property.price.toLocaleString('fr-FR') + ' €' : 'Prix NC'}
            </div>
            {property.pricePerMeter > 0 && (
              <div className="text-xs text-slate-400">{Math.round(property.pricePerMeter).toLocaleString('fr-FR')} €/m²</div>
            )}
          </div>
          <div className="flex gap-2">
            {advert?.url && (
              <a href={advert.url} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-700 transition-colors">
                <ExternalLink size={15} />
              </a>
            )}
            {property.transactionType === 0 && property.price > 0 && (
              <Link
                href={`/outils/calculateur-mensualite?prix=${property.price}&surface=${property.surface}`}
                className="p-2 rounded-lg border border-blue-200 hover:border-blue-400 text-blue-500 hover:text-blue-700 transition-colors"
                title="Simuler la mensualité"
              >
                <Calculator size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function RecherchePage() {
  // Filtres
  const [transactionType, setTransactionType] = useState('0')
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [surfaceMin, setSurfaceMin] = useState('')
  const [surfaceMax, setSurfaceMax] = useState('')
  const [roomMin, setRoomMin] = useState('')
  const [roomMax, setRoomMax] = useState('')

  // Localisation
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Résultats
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  const locationRef = useRef<HTMLDivElement>(null)

  // Autocomplétion localisation
  useEffect(() => {
    if (locationQuery.length < 2) { setLocationSuggestions([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/melo/locations?q=${encodeURIComponent(locationQuery)}`)
      const data = await res.json()
      setLocationSuggestions(data)
      setShowSuggestions(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [locationQuery])

  // Fermer suggestions au clic extérieur
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const togglePropertyType = (val: string) => {
    setPropertyTypes(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const addLocation = (loc: Location) => {
    if (!selectedLocations.find(l => l.id === loc.id)) {
      setSelectedLocations(prev => [...prev, loc])
    }
    setLocationQuery('')
    setShowSuggestions(false)
  }

  const removeLocation = (id: number) => {
    setSelectedLocations(prev => prev.filter(l => l.id !== id))
  }

  const search = useCallback(async (p = 1) => {
    setLoading(true)
    setHasSearched(true)
    setPage(p)

    const params = new URLSearchParams()
    params.set('transactionType', transactionType)
    params.set('page', String(p))

    propertyTypes.forEach(t => params.append('propertyTypes', t))
    if (budgetMin) params.set('budgetMin', budgetMin)
    if (budgetMax) params.set('budgetMax', budgetMax)
    if (surfaceMin) params.set('surfaceMin', surfaceMin)
    if (surfaceMax) params.set('surfaceMax', surfaceMax)
    if (roomMin) params.set('roomMin', roomMin)
    if (roomMax) params.set('roomMax', roomMax)

    selectedLocations.forEach(loc => {
      if (loc.type === 'department') {
        params.append('includedDepartments', `/departments/${loc.id}`)
      } else {
        params.append('includedCities', `/cities/${loc.id}`)
      }
    })

    try {
      const res = await fetch(`/api/melo/properties?${params.toString()}`)
      const data = await res.json()
      setProperties(data['hydra:member'] ?? [])
      setTotal(data['hydra:totalItems'] ?? 0)
    } catch {
      setProperties([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [transactionType, propertyTypes, budgetMin, budgetMax, surfaceMin, surfaceMax, roomMin, roomMax, selectedLocations])

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Recherche immobilière</h1>
            {hasSearched && !loading && (
              <p className="text-sm text-slate-400">{total.toLocaleString('fr-FR')} annonce{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}</p>
            )}
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 text-sm border border-slate-200 hover:border-slate-400 px-4 py-2 rounded-lg transition-colors text-slate-600">
            <SlidersHorizontal size={15} />
            Filtres
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">

        {/* Panel filtres */}
        {showFilters && (
          <aside className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-20">

              {/* Transaction */}
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">Transaction</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200">
                  {TRANSACTION_TYPES.map(t => (
                    <button key={t.value} onClick={() => setTransactionType(t.value)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${transactionType === t.value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type de bien */}
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">Type de bien</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map(t => (
                    <button key={t.value} onClick={() => togglePropertyType(t.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${propertyTypes.includes(t.value) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Localisation */}
              <div className="mb-5" ref={locationRef}>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">Localisation</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ville, département..."
                    value={locationQuery}
                    onChange={e => setLocationQuery(e.target.value)}
                    onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      {locationSuggestions.map(loc => (
                        <button key={loc.id} onClick={() => addLocation(loc)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between">
                          <span>{loc.name}</span>
                          <span className="text-xs text-slate-400">{loc.zipcode ?? loc.department?.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLocations.map(loc => (
                      <span key={loc.id} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {loc.name}
                        <button onClick={() => removeLocation(loc.id)}><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget */}
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">Budget (€)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={budgetMin} onChange={e => setBudgetMin(e.target.value)}
                    className="flex-1 py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                  <input type="number" placeholder="Max" value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
                    className="flex-1 py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              {/* Surface */}
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">Surface (m²)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={surfaceMin} onChange={e => setSurfaceMin(e.target.value)}
                    className="flex-1 py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                  <input type="number" placeholder="Max" value={surfaceMax} onChange={e => setSurfaceMax(e.target.value)}
                    className="flex-1 py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              {/* Pièces */}
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">Pièces</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={roomMin} onChange={e => setRoomMin(e.target.value)}
                    className="flex-1 py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                  <input type="number" placeholder="Max" value={roomMax} onChange={e => setRoomMax(e.target.value)}
                    className="flex-1 py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                </div>
              </div>

              <button onClick={() => search(1)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                <Search size={16} /> Rechercher
              </button>
            </div>
          </aside>
        )}

        {/* Résultats */}
        <main className="flex-1 min-w-0">
          {!hasSearched && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-700 mb-2">Lancez votre recherche</h2>
              <p className="text-slate-400 text-sm max-w-xs">Utilisez les filtres pour trouver les biens correspondant à vos critères d'investissement.</p>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-6 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasSearched && !loading && properties.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Home size={24} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-700 mb-2">Aucun résultat</h2>
              <p className="text-slate-400 text-sm">Essayez d'élargir vos critères de recherche.</p>
            </div>
          )}

          {!loading && properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.map(p => <PropertyCard key={p.uuid} property={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button onClick={() => search(page - 1)} disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-slate-600">Page {page} / {totalPages}</span>
                  <button onClick={() => search(page + 1)} disabled={page === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
