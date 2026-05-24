import { Link, useLocation, useParams } from 'react-router-dom'
import { formatMoney, getValue } from '../../utils/accommodation'

export default function ReservationConfirmationPage() {
  const { reservaGuid } = useParams()
  const location = useLocation()
  const reserva = location.state?.reserva
  const draft = location.state?.draft

  const code = getValue(reserva, ['codigoReserva', 'CodigoReserva'], reservaGuid)
  const total = getValue(reserva, ['totalReserva', 'TotalReserva'], draft?.totals?.total)
  const pending = getValue(reserva, ['saldoPendiente', 'SaldoPendiente'], total)
  const status = getValue(reserva, ['estadoReserva', 'EstadoReserva'], 'PENDIENTE')

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <p className="text-sm font-bold uppercase">Reserva creada</p>
        <h1 className="mt-2 text-3xl font-bold">Codigo {code}</h1>
        <p className="mt-3">Tu reserva fue registrada correctamente. Conserva este codigo para seguimiento.</p>
      </div>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Resumen</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-xs text-slate-500">Reserva GUID</p>
            <p className="mt-1 break-all font-semibold">{getValue(reserva, ['reservaGuid', 'ReservaGuid'], reservaGuid)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-xs text-slate-500">Estado</p>
            <p className="mt-1 font-semibold">{status}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-xs text-slate-500">Total</p>
            <p className="mt-1 font-semibold">{formatMoney(total)}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-xs text-slate-500">Saldo pendiente</p>
            <p className="mt-1 font-semibold">{formatMoney(pending)}</p>
          </div>
        </div>

        {draft && (
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <p className="font-bold text-slate-950 dark:text-white">{draft.alojamiento.nombre}</p>
            <p className="mt-1 text-sm text-slate-500">{draft.search.fechaInicio} a {draft.search.fechaFin}</p>
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/alojamientos" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
          Nueva busqueda
        </Link>
        <Link to="/" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold dark:border-slate-700">
          Ir al inicio
        </Link>
      </div>
    </main>
  )
}
