import { bookingApi } from './bookingApi'

export const accommodationService = {
  searchSucursales: (params) => bookingApi.searchAccommodations(params),
  getSucursalDetail: (sucursalGuid, params) => bookingApi.getAccommodation(sucursalGuid, params),
  getSucursalReviews: (sucursalGuid) => bookingApi.getReviews(sucursalGuid),
}

