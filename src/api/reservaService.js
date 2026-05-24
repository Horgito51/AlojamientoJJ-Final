import { bookingApi } from './bookingApi'

export const reservaService = {
  createPublicReserva: (payload) => bookingApi.createPublicReservation(payload),
}

