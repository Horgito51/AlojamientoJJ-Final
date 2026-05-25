import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { reservaService } from '../../api/reservaService'
import SimulatedPaymentModal from '../../components/common/SimulatedPaymentModal'
import { CHECKOUT_STORAGE_KEY, formatMoney, getHttpErrorMessage, getValue, toApiDateTime } from '../../utils/accommodation'

const emptyClient = {
  tipoIdentificacion: 'CED',
  numeroIdentificacion: '',
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  direccion: '',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [draft] = useState(() => {
    const stored = sessionStorage.getItem(CHECKOUT_STORAGE_KEY)
    if (!stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY)
      return null
    }
  })
  const [client, setClient] = useState(emptyClient)
  const [observaciones, setObservaciones] = useState('')
  const [reservationPayload, setReservationPayload] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    return client.numeroIdentificacion && client.nombres && client.correo && client.telefono
  }, [client])

  const buildReservationPayload = () => ({
    sucursalGuid: draft.sucursalGuid,
    fechaInicio: toApiDateTime(draft.search.fechaInicio, '14:00:00'),
    fechaFin: toApiDateTime(draft.search.fechaFin, '12:00:00'),
    origenCanalReserva: 'WEB',
    observaciones: observaciones.trim(),
    esWalkin: false,
    cliente: client,
    habitaciones: draft.rooms.map((room) => ({
      tipoHabitacionGuid: room.tipoHabitacionGuid,
      numHabitaciones: Number(room.numHabitaciones || 1),
      numAdultos: Number(room.numAdultos || draft.search.adultos || 1),
      numNinos: Number(room.numNinos || draft.search.ninos || 0),
    })),
  })

  const submitReservation = async (event) => {
    event.preventDefault()
    if (!draft) return
    if (!canSubmit) {
      setError('Completa los datos obligatorios del cliente.')
      return
    }

    if (!draft.sucursalGuid || !draft.rooms?.length) {
      setError('La reserva no tiene sucursal o tipo de habitacion seleccionado.')
      return
    }

    if (!draft.search?.fechaInicio || !draft.search?.fechaFin || new Date(`${draft.search.fechaInicio}T00:00:00`) >= new Date(`${draft.search.fechaFin}T00:00:00`)) {
      setError('La fecha de salida debe ser posterior a la fecha de entrada.')
      return
    }

    setReservationPayload(buildReservationPayload())
    setShowPayment(true)
    setError('')
  }

  const confirmSimulatedPayment = async () => {
    if (!reservationPayload) return
    setSubmitting(true)
    setError('')

    try {
      const created = await reservaService.createPublicReserva(reservationPayload)
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY)
      navigate(`/reserva/${getValue(created, ['reservaGuid', 'ReservaGuid', 'id', 'Id'], 'confirmada')}`, {
        state: { reserva: created, draft },
      })
    } catch (err) {
      console.error('Public reservation error:', err?.response?.data || err)
      setError(getHttpErrorMessage(err, 'No se pudo crear la reserva.'))
      setShowPayment(false)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  if (!draft) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">No hay una reserva en proceso</h1>
        <p className="mt-3 text-slate-500">Vuelve a seleccionar un alojamiento y habitaciones.</p>
        <Link to="/alojamientos" className="mt-6 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
          Buscar alojamientos
        </Link>
      </main>
    )
  }

  return (
    <main className="bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <form onSubmit={submitReservation} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-bold uppercase text-indigo-600">Checkout</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Datos del huesped</h1>
          {error && <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo de identificacion</span>
              <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={client.tipoIdentificacion} onChange={(e) => setClient((p) => ({ ...p, tipoIdentificacion: e.target.value }))}>
                <option value="CED">Cedula</option>
                <option value="PAS">Pasaporte</option>
                <option value="RUC">RUC</option>
              </select>
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Numero de identificacion</span>
              <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={client.numeroIdentificacion} onChange={(e) => setClient((p) => ({ ...p, numeroIdentificacion: e.target.value }))} />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nombres</span>
              <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={client.nombres} onChange={(e) => setClient((p) => ({ ...p, nombres: e.target.value }))} />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Apellidos</span>
              <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={client.apellidos} onChange={(e) => setClient((p) => ({ ...p, apellidos: e.target.value }))} />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Correo</span>
              <input type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={client.correo} onChange={(e) => setClient((p) => ({ ...p, correo: e.target.value }))} />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Telefono</span>
              <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={client.telefono} onChange={(e) => setClient((p) => ({ ...p, telefono: e.target.value }))} />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Direccion</span>
              <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={client.direccion} onChange={(e) => setClient((p) => ({ ...p, direccion: e.target.value }))} />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Observaciones</span>
              <textarea rows="4" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </label>
          </div>

          <button disabled={submitting} className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Creando reserva...' : 'Continuar al pago'}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">{draft.alojamiento.nombre}</h2>
          <p className="mt-1 text-sm text-slate-500">{draft.alojamiento.ubicacion}</p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Entrada</span><strong>{draft.search.fechaInicio}</strong></div>
            <div className="flex justify-between"><span>Salida</span><strong>{draft.search.fechaFin}</strong></div>
            <div className="flex justify-between"><span>Noches</span><strong>{draft.totals.nights}</strong></div>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            {draft.rooms.map((room) => (
              <div key={room.tipoHabitacionGuid} className="mb-3 flex justify-between gap-4 text-sm">
                <span>{room.numHabitaciones} x {room.nombre}</span>
                <strong>{formatMoney(room.precioBase * room.numHabitaciones * draft.totals.nights)}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="flex justify-between text-sm"><span>Subtotal</span><strong>{formatMoney(draft.totals.subtotal)}</strong></div>
            <div className="mt-2 flex justify-between text-sm"><span>IVA</span><strong>{formatMoney(draft.totals.iva)}</strong></div>
            <div className="mt-4 flex justify-between text-lg font-bold"><span>Total</span><span className="text-indigo-600">{formatMoney(draft.totals.total)}</span></div>
          </div>
        </aside>
      </div>
      <SimulatedPaymentModal
        isOpen={showPayment}
        total={draft.totals.total}
        onClose={() => setShowPayment(false)}
        onConfirm={confirmSimulatedPayment}
      />
    </main>
  )
}
