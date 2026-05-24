import { reservationService } from './reservationService'

export const clienteService = {
  findByEmail: (correo) => reservationService.findClienteByEmail(correo),
  create: (payload) => reservationService.createCliente(payload),
}

