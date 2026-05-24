import { Link } from 'react-router-dom'
import logo from '../../assets/images/Logo.png'
import {
  formatMoney,
  getAccommodationGuid,
  getAccommodationLocation,
  getAccommodationTitle,
  getValue,
} from '../../utils/accommodation'

export default function SucursalCard({ sucursal, search = '' }) {
  const guid = getAccommodationGuid(sucursal)
  const rating = getValue(sucursal, ['promedioValoracion', 'PromedioValoracion'])
  const services = getValue(sucursal, ['serviciosDestacados', 'ServiciosDestacados'], [])
  const price = Number(getValue(sucursal, ['precioDesde', 'PrecioDesde'], 0))

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="grid md:grid-cols-[240px_1fr]">
        <div className="flex h-56 items-center justify-center bg-slate-100 p-8 md:h-full dark:bg-slate-800">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
              <img src={logo} alt="Alojamiento JJ" className="h-full w-full object-contain p-3" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Sucursal</span>
          </div>
        </div>
        <div className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">{getAccommodationTitle(sucursal)}</h2>
              <p className="mt-1 text-sm text-slate-500">{getAccommodationLocation(sucursal)}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                {getValue(sucursal, ['tipoAlojamiento', 'TipoAlojamiento'], 'Alojamiento')}
                {getValue(sucursal, ['estrellas', 'Estrellas']) ? ` · ${getValue(sucursal, ['estrellas', 'Estrellas'])} estrellas` : ''}
              </p>
            </div>
            {rating && <span className="rounded-md bg-indigo-600 px-2 py-1 text-sm font-bold text-white">{Number(rating).toFixed(1)}</span>}
          </div>

          <p className="mt-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {getValue(sucursal, ['descripcion', 'Descripcion'], 'Sucursal disponible para las fechas seleccionadas.')}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {(Array.isArray(services) ? services : []).slice(0, 4).map((service) => (
              <span key={String(service)} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {String(service)}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-end justify-between gap-4 pt-6">
            <div>
              <p className="text-xs text-slate-500">Desde</p>
              <p className="text-2xl font-bold text-slate-950 dark:text-white">{formatMoney(price)}</p>
            </div>
            <Link to={`/alojamientos/${guid}${search ? `?${search}` : ''}`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500">
              Ver disponibilidad
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
