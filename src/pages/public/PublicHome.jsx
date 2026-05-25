import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { accommodationService } from '../../api/accommodationService'
import SucursalCard from '../../components/common/SucursalCard'
import hotelImg from '../../assets/images/hotelJJ.png'
import { addDays, getDefaultDateRange, loadStoredSearch, persistSearchState } from '../../utils/accommodation'

export default function PublicHome() {
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)
  const [stayDates, setStayDates] = useState(() => {
    const defaults = getDefaultDateRange()
    const stored = loadStoredSearch()
    const fechaInicio = stored.fechaInicio || defaults.fechaInicio
    const fechaFin = stored.fechaFin && stored.fechaFin > fechaInicio ? stored.fechaFin : addDays(fechaInicio, 1)
    return { fechaInicio, fechaFin }
  })

  useEffect(() => {
    let alive = true
    accommodationService.searchSucursales({ destino: '', pagina: 1, limite: 3 })
      .then((items) => {
        if (alive) {
          setSucursales(items.items.slice(0, 3))
        }
      })
      .catch((err) => {
        console.error('Error fetching accommodations:', err)
        if (alive) setSucursales([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    persistSearchState(stayDates)
  }, [stayDates])

  const updateCheckIn = (value) => {
    if (!value) return
    const next = { ...stayDates, fechaInicio: value }
    if (!next.fechaFin || next.fechaFin <= value) next.fechaFin = addDays(value, 1)
    setStayDates(next)
  }

  const updateCheckOut = (value) => {
    if (!value) return
    const safeValue = value <= stayDates.fechaInicio ? addDays(stayDates.fechaInicio, 1) : value
    setStayDates((prev) => ({ ...prev, fechaFin: safeValue }))
  }

  const searchQuery = new URLSearchParams({
    fechaInicio: stayDates.fechaInicio,
    fechaFin: stayDates.fechaFin,
    adultos: '2',
    ninos: '0',
    habitaciones: '1',
  }).toString()

  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden bg-[#0b1220]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b1220_0%,#12313a_45%,#3f2f24_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.78)_100%)]" />
        <div className="absolute left-0 top-0 h-full w-full opacity-70">
          <div className="absolute left-[6%] top-[24%] h-64 w-52 rounded-t-[3rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20" />
          <div className="absolute left-[18%] top-[18%] h-80 w-64 rounded-t-[3rem] border border-white/10 bg-white/[0.09] shadow-2xl shadow-black/20" />
          <div className="absolute right-[8%] top-[22%] h-72 w-72 rounded-t-[4rem] border border-white/10 bg-white/[0.08] shadow-2xl shadow-black/20" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-black/20" />
          <div className="absolute bottom-28 left-[10%] grid grid-cols-4 gap-3">
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index} className="h-7 w-7 rounded-sm bg-amber-200/20" />
            ))}
          </div>
          <div className="absolute bottom-32 right-[12%] grid grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, index) => (
              <span key={index} className="h-6 w-8 rounded-sm bg-sky-100/20" />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-slate-950/35" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Hoteles comodos para cada viaje
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-slate-200">
            Encuentra sedes disponibles, compara opciones y reserva tu estadia con atencion cercana y espacios pensados para descansar.
          </p>
          <div className="mt-8 grid w-full max-w-2xl gap-3 rounded-xl border border-white/20 bg-black/25 p-4 backdrop-blur-sm sm:grid-cols-2">
            <label>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">Entrada</span>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                className="mt-1 w-full rounded-md border border-white/30 bg-white/90 px-3 py-2 text-sm text-slate-900"
                value={stayDates.fechaInicio}
                onChange={(e) => updateCheckIn(e.target.value)}
              />
            </label>
            <label>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">Salida</span>
              <input
                type="date"
                min={stayDates.fechaInicio}
                className="mt-1 w-full rounded-md border border-white/30 bg-white/90 px-3 py-2 text-sm text-slate-900"
                value={stayDates.fechaFin}
                onChange={(e) => updateCheckOut(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to={`/alojamientos?${searchQuery}`}
              className="rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95"
            >
              Reservar Ahora
            </Link>
            <a
              href="#sobre-nosotros"
              className="rounded-full border-2 border-white bg-transparent px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-indigo-600"
            >
              Conócenos
            </a>
          </div>
        </div>
      </section>

      {/* Sucursales Destacadas */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Nuestras sedes</p>
          <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">Sucursales disponibles</h2>
          <div className="mt-4 h-1.5 w-20 rounded-full bg-indigo-600" />
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : sucursales.length > 0 ? (
          <>
            <div className="grid gap-8 lg:grid-cols-2">
              {sucursales.map((sucursal) => (
                <SucursalCard key={sucursal.sucursalGuid || sucursal.id} sucursal={sucursal} search={searchQuery} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to={`/alojamientos?${searchQuery}`} className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-500">
                Ver alojamientos
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xl text-slate-500">No se encontraron sucursales disponibles para los filtros seleccionados.</p>
            <Link to="/alojamientos" className="mt-4 inline-block text-indigo-600 underline">Consultar todas las fechas</Link>
          </div>
        )}
      </section>

      {/* Sobre Nosotros Section */}
      <section id="sobre-nosotros" className="bg-white py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-2xl bg-indigo-600/10 blur-xl transition-all group-hover:bg-indigo-600/20" />
              <img
                src={hotelImg}
                alt="Nuestro Hotel"
                className="relative rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-2xl bg-indigo-600 p-4 shadow-xl sm:block">
                <div className="flex h-full flex-col items-center justify-center text-center text-white">
                  <span className="text-3xl font-bold">10+</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Años de Excelencia</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Quiénes Somos</p>
                <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">Alojamiento JJ</h2>
              </div>
              
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                Alojamiento JJ es una cadena de hoteles nacida con el deseo de ofrecer un hogar lejos de casa. 
                Contamos con sedes pensadas para turismo, negocios y descanso, combinando instalaciones modernas 
                con un servicio cercano y confiable.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-6 transition-colors hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/30">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nuestra Misión</h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Brindar un servicio hotelero excepcional, combinando confort, hospitalidad y tecnologia para 
                    superar las expectativas de nuestros huespedes en cada sede.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-6 transition-colors hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/30">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nuestra Visión</h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Ser el referente de hospitalidad en el Austro ecuatoriano, reconocidos por nuestra calidez 
                    humana, excelencia en el servicio y compromiso con el bienestar de quienes nos visitan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
