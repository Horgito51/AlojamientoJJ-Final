import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { accommodationService } from '../../api/accommodationService'
import RoomTypeCard from '../../components/common/RoomTypeCard'
import {
  CHECKOUT_STORAGE_KEY,
  asArray,
  addDays,
  buildSearchParamsFromUrl,
  formatMoney,
  getAccommodationImage,
  getAccommodationLocation,
  getAccommodationTitle,
  hydrateSearchDates,
  getNights,
  getHttpErrorMessage,
  loadStoredSearch,
  persistSearchState,
  getRoomTypeAdults,
  getRoomTypeChildren,
  getRoomTypeGuid,
  getRoomTypeName,
  getRoomTypePrice,
  getRoomTypes,
  getValue,
} from '../../utils/accommodation'

export default function AccommodationDetailPage() {
  const { sucursalGuid } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const search = useMemo(() => {
    const fromUrl = buildSearchParamsFromUrl(searchParams)
    const stored = loadStoredSearch()
    const merged = { ...stored, ...fromUrl }
    return hydrateSearchDates(merged)
  }, [searchParams])
  const [detail, setDetail] = useState(null)
  const [reviews, setReviews] = useState([])
  const [selection, setSelection] = useState({})
  const [stayDates, setStayDates] = useState({ fechaInicio: search.fechaInicio, fechaFin: search.fechaFin })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setStayDates({ fechaInicio: search.fechaInicio, fechaFin: search.fechaFin })
    persistSearchState(search)
  }, [search])

  useEffect(() => {
    let alive = true

    Promise.resolve()
      .then(() => {
        if (!alive) return null
        setLoading(true)
        setError('')
        return Promise.all([
          accommodationService.getSucursalDetail(sucursalGuid, search),
          accommodationService.getSucursalReviews(sucursalGuid).catch(() => []),
        ])
      })
      .then((response) => {
        if (!alive || !response) return
        const [detailData, reviewData] = response
        setDetail(detailData)
        setReviews(reviewData)
      })
      .catch((err) => {
        console.error('Accommodation detail error:', err?.response?.data || err)
        if (alive) setError(getHttpErrorMessage(err, 'No se pudo cargar el detalle del alojamiento.'))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [sucursalGuid, search])

  const roomTypes = useMemo(() => getRoomTypes(detail), [detail])
  const nights = getNights(search.fechaInicio, search.fechaFin)
  const selectedRooms = useMemo(() => {
    return roomTypes
      .map((roomType) => {
        const guid = getRoomTypeGuid(roomType)
        return { roomType, guid, quantity: Number(selection[guid] || 0) }
      })
      .filter((item) => item.guid && item.quantity > 0)
  }, [roomTypes, selection])

  const subtotal = selectedRooms.reduce((acc, item) => acc + getRoomTypePrice(item.roomType) * item.quantity * Math.max(nights, 1), 0)
  const iva = Number((subtotal * 0.12).toFixed(2))
  const total = Number((subtotal + iva).toFixed(2))

  const syncSearchWithDates = (nextDates) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('fechaInicio', nextDates.fechaInicio)
    nextParams.set('fechaFin', nextDates.fechaFin)
    if (!nextParams.get('adultos')) nextParams.set('adultos', String(search.adultos || 2))
    if (!nextParams.get('ninos')) nextParams.set('ninos', String(search.ninos || 0))
    if (!nextParams.get('habitaciones')) nextParams.set('habitaciones', String(search.habitaciones || 1))
    setSearchParams(nextParams)
    persistSearchState({ ...search, ...nextDates })
    setError('')
  }

  const updateCheckIn = (value) => {
    if (!value) return
    const nextDates = { ...stayDates, fechaInicio: value }
    if (!nextDates.fechaFin || nextDates.fechaFin <= value) {
      nextDates.fechaFin = addDays(value, 1)
    }
    setStayDates(nextDates)
    syncSearchWithDates(nextDates)
  }

  const updateCheckOut = (value) => {
    if (!value) return
    const safeValue = value <= stayDates.fechaInicio ? addDays(stayDates.fechaInicio, 1) : value
    const nextDates = { ...stayDates, fechaFin: safeValue }
    setStayDates(nextDates)
    syncSearchWithDates(nextDates)
  }

  const continueToCheckout = () => {
    if (!search.fechaInicio || !search.fechaFin || nights <= 0) {
      setError('Selecciona fechas validas desde la busqueda antes de reservar.')
      return
    }

    if (selectedRooms.length === 0) {
      setError('Selecciona al menos un tipo de habitacion.')
      return
    }

    const invalidCapacity = selectedRooms.find(({ roomType, quantity }) => {
      const adultos = Number(search.adultos || 1)
      const ninos = Number(search.ninos || 0)
      return adultos > getRoomTypeAdults(roomType) * quantity || ninos > getRoomTypeChildren(roomType) * quantity
    })

    if (invalidCapacity) {
      setError(`La cantidad de huespedes supera la capacidad de ${getRoomTypeName(invalidCapacity.roomType)}.`)
      return
    }

    const draft = {
      sucursalGuid,
      alojamiento: {
        nombre: getAccommodationTitle(detail),
        ubicacion: getAccommodationLocation(detail),
        imagen: getAccommodationImage(detail),
      },
      search,
      rooms: selectedRooms.map(({ roomType, guid, quantity }) => ({
        tipoHabitacionGuid: guid,
        nombre: getRoomTypeName(roomType),
        precioBase: getRoomTypePrice(roomType),
        numHabitaciones: quantity,
        numAdultos: Number(search.adultos || 1),
        numNinos: Number(search.ninos || 0),
      })),
      totals: { nights, subtotal, iva, total },
    }

    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(draft))
    navigate('/checkout')
  }

  if (loading) return <main className="p-8 text-center">Cargando alojamiento...</main>
  if (error && !detail) return <main className="p-8 text-center text-red-600">{error}</main>
  if (!detail) return <main className="p-8 text-center">Alojamiento no encontrado.</main>

  const image = getAccommodationImage(detail)
  const amenities = asArray(getValue(detail, ['amenities', 'Amenities', 'servicios', 'Servicios']))
  const policies = getValue(detail, ['politicas', 'Politicas'], {})
  const policyText = getValue(policies, ['politicas', 'Politicas'])

  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link to={`/alojamientos?${searchParams.toString()}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
            Volver a resultados
          </Link>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
              {image ? <img src={image} alt={getAccommodationTitle(detail)} className="h-[420px] w-full object-cover" /> : <div className="flex h-[420px] items-center justify-center text-slate-500">Sin imagen</div>}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold uppercase text-indigo-600">Detalle del alojamiento</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">{getAccommodationTitle(detail)}</h1>
              <p className="mt-2 text-slate-500">{getAccommodationLocation(detail)}</p>
              <p className="mt-6 leading-7 text-slate-600 dark:text-slate-300">
                {getValue(detail, ['descripcion', 'Descripcion'], 'Alojamiento disponible para estancias comodas con servicios esenciales.')}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Noches</p>
                  <p className="text-lg font-bold">{nights || '-'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Adultos</p>
                  <p className="text-lg font-bold">{search.adultos}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs text-slate-500">Ninos</p>
                  <p className="text-lg font-bold">{search.ninos}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-bold uppercase text-slate-500">Entrada</span>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    value={stayDates.fechaInicio}
                    onChange={(e) => updateCheckIn(e.target.value)}
                  />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase text-slate-500">Salida</span>
                  <input
                    type="date"
                    min={stayDates.fechaInicio}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    value={stayDates.fechaFin}
                    onChange={(e) => updateCheckOut(e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>

          {amenities.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {amenities.map((item) => <span key={String(item)} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{String(item)}</span>)}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Tipos de habitacion disponibles</h2>
          <div className="mt-5 space-y-4">
            {roomTypes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                No hay tipos de habitacion disponibles para estas fechas.
              </div>
            ) : roomTypes.map((roomType, index) => {
              const guid = getRoomTypeGuid(roomType) || String(index)

              return (
                <RoomTypeCard
                  key={guid}
                  roomType={roomType}
                  quantity={selection[guid] || 0}
                  onQuantityChange={(nextGuid, value) => setSelection((prev) => ({ ...prev, [nextGuid]: value }))}
                />
              )
            })}
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Valoraciones</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {reviews.length === 0 ? (
                <p className="rounded-lg bg-white p-5 text-slate-500 dark:bg-slate-900">Aun no hay valoraciones disponibles.</p>
              ) : reviews.map((review, index) => (
                <article key={getValue(review, ['valoracionGuid', 'idValoracion', 'id'], index)} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-bold text-slate-950 dark:text-white">Puntuacion {getValue(review, ['puntuacionGeneral', 'PuntuacionGeneral', 'puntuacionLimpieza'], '-')}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{getValue(review, ['comentarioPositivo', 'comentario', 'Comentario'], 'Sin comentario.')}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Resumen</h2>
          {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="mt-4 space-y-3">
            {selectedRooms.length === 0 ? (
            <p className="text-sm text-slate-500">Selecciona uno o mas tipos de habitacion para continuar.</p>
            ) : selectedRooms.map(({ roomType, guid, quantity }) => (
              <div key={guid} className="flex justify-between gap-4 text-sm">
                <span>{quantity} x {getRoomTypeName(roomType)}</span>
                <strong>{formatMoney(getRoomTypePrice(roomType) * quantity * Math.max(nights, 1))}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="flex justify-between text-sm"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
            <div className="mt-2 flex justify-between text-sm"><span>IVA</span><strong>{formatMoney(iva)}</strong></div>
            <div className="mt-4 flex justify-between text-lg font-bold"><span>Total</span><span className="text-indigo-600">{formatMoney(total)}</span></div>
          </div>
          <button onClick={continueToCheckout} className="mt-5 w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500">
            Continuar al checkout
          </button>
          {policyText && <p className="mt-4 text-xs text-slate-500">{String(policyText)}</p>}
        </aside>
      </section>
    </main>
  )
}
