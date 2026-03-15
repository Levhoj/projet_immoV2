import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { MapPin, Maximize2, Home, BedDouble, Calendar, ChevronLeft, ExternalLink, Building2, TrendingUp } from 'lucide-react'
import SaveButton from '@/components/ui/SaveButton'
import { isPropertySaved } from '@/lib/supabase'

async function getProperty(uuid: string) {
  try {
    const res = await fetch(
      `https://preprod-api.notif.immo/documents/properties/${uuid}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.MELO_API_KEY!,
        },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function EnergyBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    A: 'bg-green-600 text-white', B: 'bg-green-500 text-white',
    C: 'bg-lime-500 text-white', D: 'bg-yellow-400 text-slate-900',
    E: 'bg-orange-500 text-white', F: 'bg-red-400 text-white',
    G: 'bg-red-600 text-white',
  }
  return (
    <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${colors[category] ?? 'bg-slate-200 text-slate-600'}`}>
      DPE {category}
    </span>
  )
}

export default async function AnnoncePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const property = await getProperty(uuid)
  if (!property) notFound()

  const advert = property.adverts?.[0]
  const pics = advert?.pictures?.length ? advert.pictures : advert?.picturesRemote ?? []

  const typeLabels: Record<number, string> = {
    0: 'Appartement', 1: 'Maison', 2: 'Immeuble',
    3: 'Parking', 4: 'Bureau', 5: 'Terrain', 6: 'Commerce'
  }

  // Paramètres pré-remplis pour le simulateur
  const simulParams = new URLSearchParams()
  if (property.price) simulParams.set('prix', String(property.price))
  if (advert?.condominiumFees) simulParams.set('copro', String(advert.condominiumFees))
  if (property.surface) simulParams.set('surface', String(property.surface))
  if (property.title) simulParams.set('titre', property.title)
  if (property.city?.name) simulParams.set('ville', property.city.name)
  if (property.city?.zipcode) simulParams.set('cp', property.city.zipcode)
  if (advert?.pictures?.[0]) simulParams.set('photo', advert.pictures[0])
  else if (advert?.picturesRemote?.[0]) simulParams.set('photo', advert.picturesRemote[0])
  if (property.pricePerMeter) simulParams.set('ppm', String(Math.round(property.pricePerMeter)))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm">
          <Link href="/recherche" className="flex items-center gap-1.5 text-slate-400 hover:text-sky-500 transition-colors">
            <ChevronLeft size={15} /> Recherche
          </Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-600 truncate max-w-xs">{property.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">

            {/* Galerie photos */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {pics.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  <div className="col-span-2 row-span-2">
                    <img src={pics[0]} alt={property.title} className="w-full h-72 object-cover" />
                  </div>
                  {pics.slice(1, 3).map((pic: string, i: number) => (
                    <div key={i}>
                      <img src={pic} alt="" className="w-full h-36 object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-slate-100 flex items-center justify-center">
                  <Home size={48} className="text-slate-300" />
                </div>
              )}
            </div>

            {/* Titre et infos principales */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full">
                      {typeLabels[property.propertyType] ?? 'Bien'}
                    </span>
                    {advert?.energy?.category && (
                      <EnergyBadge category={advert.energy.category} />
                    )}
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">{property.title}</h1>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <MapPin size={14} />
                    <span>{property.city.name} ({property.city.zipcode}) — {property.city.department?.name}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-3xl font-extrabold text-slate-900">
                    {property.price > 0 ? property.price.toLocaleString('fr-FR') + ' €' : 'Prix NC'}
                  </div>
                  {property.pricePerMeter > 0 && (
                    <div className="text-sm text-slate-400">{Math.round(property.pricePerMeter).toLocaleString('fr-FR')} €/m²</div>
                  )}
                </div>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                {[
                  { icon: Maximize2, label: 'Surface', value: property.surface > 0 ? `${property.surface} m²` : '—' },
                  { icon: Home, label: 'Pièces', value: property.room > 0 ? `${property.room} pièces` : '—' },
                  { icon: BedDouble, label: 'Chambres', value: property.bedroom > 0 ? `${property.bedroom} ch.` : '—' },
                  { icon: Calendar, label: 'Construction', value: advert?.constructionYear ? advert.constructionYear : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                    <Icon size={16} className="text-slate-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                    <div className="text-sm font-semibold text-slate-800">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {advert?.description && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Description</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {advert.description}
                </p>
              </div>
            )}

            {/* Caractéristiques */}
            {advert?.features && advert.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Caractéristiques</h2>
                <div className="flex flex-wrap gap-2">
                  {advert.features.map((f: string, i: number) => (
                    <span key={i} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Charges et infos financières */}
            {(advert?.condominiumFees || advert?.rentalCharges) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Informations financières</h2>
                <div className="space-y-3">
                  {advert?.condominiumFees > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Charges de copropriété</span>
                      <span className="font-semibold text-slate-800">{advert.condominiumFees.toLocaleString('fr-FR')} € / an</span>
                    </div>
                  )}
                  {advert?.feesPercentage > 0 && (
                    <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                      <span className="text-slate-500">Honoraires agence</span>
                      <span className="font-semibold text-slate-800">{advert.feesPercentage} %</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sources */}
            {property.adverts?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Annonces ({property.adverts.length} source{property.adverts.length > 1 ? 's' : ''})
                </h2>
                <div className="space-y-3">
                  {property.adverts.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Building2 size={16} className="text-slate-400" />
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{a.publisher?.name}</div>
                          <div className="text-xs text-slate-400">{a.publisher?.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900">{a.price?.toLocaleString('fr-FR')} €</span>
                        {a.url && (
                          <a href={a.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-700 font-medium transition-colors">
                            Voir <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-4">

            {/* CTA Simuler */}
            <div className="bg-slate-900 rounded-2xl p-6 sticky top-20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-sky-400" />
                <h3 className="text-sm font-bold text-white">Simuler la rentabilité</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Le calculateur sera pré-rempli avec les informations de cette annonce.
              </p>

              <div className="space-y-2.5 mb-5">
                {[
                  ['Prix d\'achat', property.price > 0 ? property.price.toLocaleString('fr-FR') + ' €' : '—'],
                  ['Surface', property.surface > 0 ? property.surface + ' m²' : '—'],
                  ['Charges copro', advert?.condominiumFees > 0 ? advert.condominiumFees + ' € / an' : 'Non renseigné'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-200 font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/annonce/${property.uuid}/simuler?${simulParams.toString()}`}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                <TrendingUp size={15} /> Simuler la rentabilité
              </Link>

              {userId && (
                <div className="mt-3">
                  <SaveButton
                    uuid={property.uuid}
                    titre={property.title}
                    ville={property.city?.name ?? ''}
                    cp={property.city?.zipcode ?? ''}
                    prix={property.price ?? 0}
                    surface={property.surface ?? 0}
                    ppm={property.pricePerMeter ? Math.round(property.pricePerMeter) : 0}
                    photo={pics[0] ?? ''}
                    copro={advert?.condominiumFees ?? 0}
                    initialSaved={alreadySaved}
                  />
                </div>
              )}

              {advert?.url && (
                <a href={advert.url} target="_blank" rel="noopener noreferrer"
                  className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                  Voir l'annonce originale <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Contact */}
            {advert?.contact && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Contact</h3>
                {advert.contact.agency && (
                  <div className="text-sm font-semibold text-slate-800 mb-1">{advert.contact.agency}</div>
                )}
                {advert.contact.name && (
                  <div className="text-sm text-slate-500 mb-3">{advert.contact.name}</div>
                )}
                {advert.contact.phone && (
                  <a href={`tel:${advert.contact.phone}`}
                    className="block w-full text-center bg-sky-50 hover:bg-sky-100 text-sky-600 font-semibold text-sm py-2.5 rounded-xl transition-colors">
                    {advert.contact.phone}
                  </a>
                )}
              </div>
            )}

            {/* Historique des prix */}
            {advert?.events && advert.events.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Historique des prix</h3>
                <div className="space-y-2">
                  {advert.events.filter((e: any) => e.fieldName === 'price').map((e: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs">{new Date(e.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span className={`font-semibold ${e.percentVariation < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {e.percentVariation > 0 ? '+' : ''}{e.percentVariation?.toFixed(1)}%
                      </span>
                      <span className="font-semibold text-slate-800">{parseInt(e.fieldNewValue).toLocaleString('fr-FR')} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
