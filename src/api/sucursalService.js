import { accommodationService } from './accommodationService'

export const sucursalService = {
  search: accommodationService.searchSucursales,
  getByGuid: accommodationService.getSucursalDetail,
}

