import { accommodationService } from './accommodationService'
import { getRoomTypes } from '../utils/accommodation'

export const tipoHabitacionService = {
  async listBySucursal(sucursalGuid, params = {}) {
    const detail = await accommodationService.getSucursalDetail(sucursalGuid, params)
    return getRoomTypes(detail)
  },
}

