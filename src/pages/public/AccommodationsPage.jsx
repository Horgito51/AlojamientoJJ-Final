import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { accommodationService } from '../../api/accommodationService'
import SucursalCard from '../../components/common/SucursalCard'
import { buildSearchParamsFromUrl, getHttpErrorMessage, hydrateSearchDates, loadStoredSearch, persistSearchState } from '../../utils/accommodation'

const today = new Date().toISOString().slice(0, 10)

export default function AccommodationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = useMemo(() => {
    const fromUrl = buildSearchParamsFromUrl(searchParams)
    const stored = loadStoredSearch()
    const merged = { ...stored, ...fromUrl }
    return hydrateSearchDates(merged)
  }, [searchParams])
  const [form, setForm] = useState(initial)
  const [result, setResult] = useState({ items: [], pagina: 1, totalPaginas: 1, totalResultados: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const displayedItems = result.items
  const displayedTotal = result.totalResultados || result.items.length

  useEffect(() => {
    queueMicrotask(() => setForm(initial))
  }, [initial])

  useEffect(() => {
    persistSearchState(initial)
  }, [initial])

  useEffect(() => {
    let alive = true

    Promise.resolve()
      .then(() => {
        if (!alive) return null
        setLoading(true)
        setError('')
        return accommodationService.searchSucursales(initial)
      })
      .then((data) => {
        if (alive && data) setResult(data)
      })
      .catch((err) => {
        console.error('Accommodation search error:', err?.response?.data || err)
        if (alive) {
          if (err?.response?.status === 404) {
            setResult({ items: [], pagina: 1, totalPaginas: 1, totalResultados: 0 })
            setError('')
          } else {
            setError(getHttpErrorMessage(err, 'No se pudo cargar la busqueda de alojamientos.'))
          }
        }
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [initial])

  const submitSearch = (event) => {
    event.preventDefault()
    const next = new URLSearchParams()
    Object.entries({ ...form, pagina: 1 }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') next.set(key, value)
    })
    setSearchParams(next)
  }

  const goToPage = (pagina) => {
    const next = new URLSearchParams(searchParams)
    next.set('pagina', pagina)
    setSearchParams(next)
  }

  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-indigo-600">Alojamientos</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">
              Busca disponibilidad y reserva en minutos
            </h1>
          </div>

          <form onSubmit={submitSearch} className="mt-8 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-6">
            <label className="md:col-span-2">
              <span className="text-xs font-bold uppercase text-slate-500">Destino</span>
              <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.destino} onChange={(e) => setForm((p) => ({ ...p, destino: e.target.value }))} />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-slate-500">Entrada</span>
              <input type="date" min={today} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.fechaInicio} onChange={(e) => setForm((p) => ({ ...p, fechaInicio: e.target.value }))} />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-slate-500">Salida</span>
              <input type="date" min={form.fechaInicio || today} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.fechaFin} onChange={(e) => setForm((p) => ({ ...p, fechaFin: e.target.value }))} />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-slate-500">Adultos</span>
              <input type="number" min="1" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.adultos} onChange={(e) => setForm((p) => ({ ...p, adultos: e.target.value }))} />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-slate-500">Ninos</span>
              <input type="number" min="0" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.ninos} onChange={(e) => setForm((p) => ({ ...p, ninos: e.target.value }))} />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-slate-500">Habitaciones</span>
              <input type="number" min="1" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.habitaciones} onChange={(e) => setForm((p) => ({ ...p, habitaciones: e.target.value }))} />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-slate-500">Precio min.</span>
              <input type="number" min="0" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.precioMin} onChange={(e) => setForm((p) => ({ ...p, precioMin: e.target.value }))} />
            </label>
            <label>
              <span className="text-xs font-bold uppercase text-slate-500">Precio max.</span>
              <input type="number" min="0" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.precioMax} onChange={(e) => setForm((p) => ({ ...p, precioMax: e.target.value }))} />
            </label>
            <label className="md:col-span-2">
              <span className="text-xs font-bold uppercase text-slate-500">Orden</span>
              <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.ordenarPor} onChange={(e) => setForm((p) => ({ ...p, ordenarPor: e.target.value }))}>
                <option value="">Recomendados</option>
                <option value="nombre">Nombre</option>
                <option value="precio_desc">Precio mayor primero</option>
                <option value="valoracion">Mejor valorados</option>
              </select>
            </label>
            <label className="md:col-span-2">
              <span className="text-xs font-bold uppercase text-slate-500">Tipo alojamiento</span>
              <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={form.tipoAlojamiento} onChange={(e) => setForm((p) => ({ ...p, tipoAlojamiento: e.target.value }))} placeholder="Hotel, hostal, resort" />
            </label>
            <button className="self-end rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500">
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">{displayedTotal} resultados</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pagina {result.pagina} de {result.totalPaginas}</p>
        </div>

        {error && <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />)}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-900 dark:text-white">No se encontraron sucursales disponibles para los filtros seleccionados.</p>
            <p className="mt-2 text-sm text-slate-500">Prueba con menos filtros o cambia las fechas.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {displayedItems.map((item, index) => (
              <SucursalCard key={item.sucursalGuid || item.SucursalGuid || index} sucursal={item} search={searchParams.toString()} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <button disabled={result.pagina <= 1} onClick={() => goToPage(Math.max(1, result.pagina - 1))} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700">
            Anterior
          </button>
          <button disabled={!result.tieneSiguiente || result.pagina >= result.totalPaginas} onClick={() => goToPage(result.pagina + 1)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700">
            Siguiente
          </button>
        </div>
      </section>
    </main>
  )
}
