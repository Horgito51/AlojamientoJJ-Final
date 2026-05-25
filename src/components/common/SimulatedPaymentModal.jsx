import { useState } from 'react'
import Modal from './Modal'
import { formatMoney } from '../../utils/accommodation'

const initialCard = {
  holder: '',
  number: '',
  expiry: '',
  cvv: '',
}

export default function SimulatedPaymentModal({ isOpen, total = 0, onClose, onConfirm }) {
  const [card, setCard] = useState(initialCard)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const updateCard = (event) => {
    const { name, value } = event.target
    setCard((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const confirmPayment = async (event) => {
    event.preventDefault()
    setStatus('processing')
    setError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 900))
      await onConfirm?.({
        ...card,
        simulated: true,
        reference: `SIM-${Date.now()}`,
      })
      setStatus('success')
    } catch {
      setStatus('idle')
      setError('No se pudo completar la reserva despues de simular el pago.')
    }
  }

  const close = () => {
    if (status === 'processing') return
    setStatus('idle')
    setError('')
    onClose?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title="Pago simulado">
      {status === 'processing' ? (
        <div className="py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-500" />
          <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">Procesando simulacion</h3>
          <p className="mt-2 text-sm text-slate-500">Esto no valida ni cobra la tarjeta.</p>
        </div>
      ) : (
        <form onSubmit={confirmPayment} className="space-y-5">
          <div className="rounded-lg bg-slate-950 p-5 text-white">
            <p className="text-xs font-bold uppercase text-indigo-200">Total a simular</p>
            <p className="mt-2 text-3xl font-black">{formatMoney(total)}</p>
            <p className="mt-4 text-xs text-slate-300">Transaccion de prueba. No se realiza ningun cobro real.</p>
          </div>

          <div className="grid gap-4">
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nombre en la tarjeta</span>
              <input name="holder" value={card.holder} onChange={updateCard} placeholder="Nombre como aparece en la tarjeta" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Numero de tarjeta</span>
              <input name="number" value={card.number} onChange={updateCard} placeholder="0000 0000 0000 0000" inputMode="numeric" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Expiracion</span>
                <input name="expiry" value={card.expiry} onChange={updateCard} placeholder="MM/AA" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">CVV</span>
                <input name="cvv" value={card.cvv} onChange={updateCard} placeholder="123" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </label>
            </div>
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500">
              Simular pago y reservar
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
