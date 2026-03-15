'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, MapPin, Home, Euro, Maximize2, ChevronLeft, ChevronRight, ExternalLink, Calculator, X } from 'lucide-react'

interface Location {
  id: number
  name: string
  zipcode?: string
  department?: { code: string; name: string }
  type?: string
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
  energy?: { category: string }
  events?: { fieldName: string; percentVariation: number }[]
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
  pictures: string[]
  adverts: Advert[]
  pricePerMeter: number
}

const PROPERTY_TYPES = [
  { label: 'Appartement', value: '0' },
  { label: 'Maison', value: '1' },
  { label: 'Immeuble', value: '2' },
  { label: 'Terrain', value: '5' },
]

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

function PropertyCard({ property }: { property: Property }) {
  const advert = property.adverts?.[0]
  const pics = advert?.pictures?.length ? advert.pictures : advert?.picturesRemote ?? []
  const pic = pics[0] ?? null
  const hasPriceDrop = advert?.events?.some(e => e.fieldName === 'price' && e.percentVariation < 0)
  const typeLabels: Record<number, string> = { 0: 'Appartement', 1: 'Maison', 2: 'Immeuble', 3: 'Parking', 4: 'Bureau', 5: 'Terrain' }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {pic ? (
          <img src={pic} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home size={32} className="text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="text-xs font-semibold bg-sky-500 text-white px-2 py-0.5 rounded-full">
            {typeLabels[property.propertyType] ?? 'Bien'}
          </span>
          {hasPriceDrop && (
            <span className="text-xs font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Baisse prix</span>
          )}
        </div>
        {advert?.energy?.category && (
          <div className="absolute top-3 right-3"><EnergyBadge category={advert.energy.category} /></div>
        )}
        {advert?.publisher && (
          <div className="absolute bottom-3 right-3 bg-white/90 text-xs text-slate-600 px-2 py-1 rounded-lg">
            {advert.publisher.name}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{property.title}</h3>
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
          <MapPin size={11} />
          <span className="truncate">{property.city.name} ({property.city.zipcode})</span>
        </div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {property.surface > 0 && (
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">{property.surface} m²</span>
          )}
          {property.room > 0 && (
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">{property.room} p.</span>
          )}
          {property.bedroom > 0 && (
            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">{property.bedroom} ch.</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
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
                <ExternalLink size={14} />
              </a>
            )}
            {property.transactionType === 0 && property.price > 0 && (
              <Link href={`/outils/calculateur-mensualite?prix=${property.price}`}
                className="p-2 rounded-lg border border-sky-200 hover:border-sky-400 text-sky-500 hover:text-sky-700 transition-colors"
                title="Simuler la mensualité">
                <Calculator size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RangeInputs({ label, min, max, setMin, setMax, placeholder }: {
  label: string
  min: string
  max: string
  setMin: (v: string) => void
  setMax: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="mb-4">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Min"
          value={min}
          onChange={e => setMin(e.target.value)}
          className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 bg-white text-slate-900 placeholder-slate-300 min-w-0"
        />
        <input
          type="number"
          placeholder="Max"
          value={max}
          onChange={e => setMax(e.target.value)}
          className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 bg-white text-slate-900 placeholder-slate-300 min-w-0"
        />
      </div>
    </div>
  )
}

export default function RecherchePage() {
  const transactionType = '0'
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [surfaceMin, setSurfaceMin] = useState('')
  const [surfaceMax, setSurfaceMax] = useState('')
  const [roomMin, setRoomMin] = useState('')
  const [roomMax, setRoomMax] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const locationRef = useRef<HTMLDivElement>(null)
  const suggestionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (locationQuery.length < 2) {
      setLocationSuggestions([])
      setShowSuggestions(false)
      return
    }
    if (suggestionsTimer.current) clearTimeout(suggestionsTimer.current)
    suggestionsTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/melo/locations?q=${encodeURIComponent(locationQuery)}`)
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setLocationSuggestions(data)
          setShowSuggestions(true)
        } else {
          setLocationSuggestions([])
          setShowSuggestions(false)
        }
      } catch {
        setLocationSuggestions([])
      }
    }, 350)
    return () => { if (suggestionsTimer.current) clearTimeout(suggestionsTimer.current) }
  }, [locationQuery])

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
    setLocationSuggestions([])
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
      <div className="bg-white border-b border-slate-200 sticky top-[57px] z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900">Recherche immobilière</h1>
            {hasSearched && !loading && (
              <p className="text-xs text-slate-400">{total.toLocaleString('fr-FR')} annonce{total > 1 ? 's' : ''}</p>
            )}
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 text-sm border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors text-slate-600">
            <SlidersHorizontal size={14} />
            {showFilters ? 'Masquer' : 'Filtres'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">

        {/* Filtres */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-[113px]">

              {/* Type de bien */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Type de bien</label>
                <div className="flex flex-wrap gap-1.5">
                  {PROPERTY_TYPES.map(t => (
                    <button key={t.value} onClick={() => togglePropertyType(t.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${propertyTypes.includes(t.value) ? 'bg-sky-500 text-white border-sky-500' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Localisation */}
              <div className="mb-4" ref={locationRef}>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Localisation</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Ville, département..."
                    value={locationQuery}
                    onChange={e => setLocationQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 bg-white text-slate-900 placeholder-slate-300"
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                      {locationSuggestions.map(loc => (
                        <button key={loc.id} onClick={() => addLocation(loc)}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between gap-2">
                          <span className="truncate text-slate-800">{loc.name}</span>
                          <span className="text-xs text-slate-400 flex-shrink-0">{loc.zipcode ?? loc.department?.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedLocations.map(loc => (
                      <span key={loc.id} className="flex items-center gap-1 text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-full border border-sky-200">
                        <span className="truncate max-w-20">{loc.name}</span>
                        <button onClick={() => setSelectedLocations(prev => prev.filter(l => l.id !== loc.id))} className="flex-shrink-0">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget, Surface, Pièces */}
              <RangeInputs label="Budget (€)" min={budgetMin} max={budgetMax} setMin={setBudgetMin} setMax={setBudgetMax} />
              <RangeInputs label="Surface (m²)" min={surfaceMin} max={surfaceMax} setMin={setSurfaceMin} setMax={setSurfaceMax} />
              <RangeInputs label="Pièces" min={roomMin} max={roomMax} setMin={setRoomMin} setMax={setRoomMax} />

              <button onClick={() => search(1)}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors mt-2">
                <Search size={15} /> Rechercher
              </button>
            </div>
          </aside>
        )}

        {/* Résultats */}
        <main className="flex-1 min-w-0">
          {!hasSearched && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 bg-sky-50 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-sky-500" />
              </div>
              <h2 className="text-base font-semibold text-slate-700 mb-2">Lancez votre recherche</h2>
              <p className="text-slate-400 text-sm max-w-xs">Utilisez les filtres pour trouver les biens correspondant à vos critères d'investissement.</p>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="h-44 bg-slate-100" />
                  <div className="p-4 space-y-3">
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
              <h2 className="text-base font-semibold text-slate-700 mb-2">Aucun résultat</h2>
              <p className="text-slate-400 text-sm">Essayez d'élargir vos critères de recherche.</p>
            </div>
          )}

          {!loading && properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map(p => <PropertyCard key={p.uuid} property={p} />)}
              </div>
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
