import { accommodationService } from './accommodationService'

export const reviewService = {
  listBySucursal: accommodationService.getSucursalReviews,
}

