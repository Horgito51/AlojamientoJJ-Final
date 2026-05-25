import { useState } from 'react'
import Modal from './Modal'
import { formatMoney } from '../../utils/accommodation'

const initialCard = {
  holder: '',
  number: '',
  expiry: '',
  cvv: '',
}

const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

const formatCardNumber = (value) =>
  onlyDigits(value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

const formatExpiry = (value) => {
  const digits = onlyDigits(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function SimulatedPaymentModal({ isOpen, total = 0, onClose, onConfirm }) {
  const [card, setCard] = useState(initialCard)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const updateCard = (event) => {
    const { name, value } = event.target
    let nextValue = value
    if (name === 'number') nextValue = formatCardNumber(value)
    if (name === 'expiry') nextValue = formatExpiry(value)
    if (name === 'cvv') nextValue = onlyDigits(value).slice(0, 4)
    setCard((current) => ({ ...current, [name]: nextValue }))
    setError('')
  }

  const confirmPayment = async (event) => {
    event.preventDefault()
    const cardDigits = onlyDigits(card.number)
    const [month, year] = card.expiry.split('/').map((value) => Number(value))

    if (!card.holder.trim()) {
      setError('Ingresa el nombre que aparece en la tarjeta.')
      return
    }

    if (cardDigits.length !== 16) {
      setError('El numero de tarjeta debe tener 16 digitos.')
      return
    }

    if (!month || month < 1 || month > 12 || !year || String(year).length !== 2) {
      setError('Ingresa una expiracion valida en formato MM/AA.')
      return
    }

    if (onlyDigits(card.cvv).length < 3) {
      setError('El CVV debe tener 3 o 4 digitos.')
      return
    }

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
    <Modal isOpen={isOpen} onClose={close} title="Pago con tarjeta">
      {status === 'processing' ? (
        <div className="py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-500" />
          <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">Procesando pago</h3>
          <p className="mt-2 text-sm text-slate-500">Estamos registrando tu reserva.</p>
        </div>
      ) : (
        <form onSubmit={confirmPayment} className="space-y-5">
          <div className="rounded-lg bg-slate-950 p-5 text-white">
            <p className="text-xs font-bold uppercase text-indigo-200">Total a pagar</p>
            <p className="mt-2 text-3xl font-black">{formatMoney(total)}</p>
            <p className="mt-4 text-xs text-slate-300">Ingresa los datos de tu tarjeta para continuar.</p>
          </div>

          <div className="grid gap-4">
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nombre en la tarjeta</span>
              <input name="holder" value={card.holder} onChange={updateCard} placeholder="Nombre como aparece en la tarjeta" autoComplete="cc-name" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <label>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Numero de tarjeta</span>
              <input name="number" value={card.number} onChange={updateCard} placeholder="0000 0000 0000 0000" inputMode="numeric" autoComplete="cc-number" maxLength="19" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Expiracion</span>
                <input name="expiry" value={card.expiry} onChange={updateCard} placeholder="MM/AA" inputMode="numeric" autoComplete="cc-exp" maxLength="5" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">CVV</span>
                <input name="cvv" value={card.cvv} onChange={updateCard} placeholder="123" inputMode="numeric" autoComplete="cc-csc" maxLength="4" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              </label>
            </div>
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500">
              Pagar y reservar
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
