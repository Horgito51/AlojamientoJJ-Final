import api from './axiosConfig'
import { ENDPOINTS } from './endpoints'
import { normalizeEntity, normalizeList, unwrapData } from './normalize'
import { toApiDateTime } from '../utils/accommodation'

const stripEmpty = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )

export const normalizePagedResponse = (response) => {
  const data = unwrapData(response)
  const items = normalizeList(data)

  return {
    items,
    pagina: Number(data?.pagina ?? data?.Pagina ?? 1),
    limite: Number(data?.limite ?? data?.Limite ?? (items.length || 10)),
    totalResultados: Number(data?.totalResultados ?? data?.TotalResultados ?? items.length),
    totalPaginas: Math.max(1, Number(data?.totalPaginas ?? data?.TotalPaginas ?? 1)),
    tieneSiguiente: Boolean(data?.tieneSiguiente ?? data?.TieneSiguiente ?? false),
    tieneAnterior: Boolean(data?.tieneAnterior ?? data?.TieneAnterior ?? false),
  }
}

export const bookingApi = {
  async search(query = 'Cuenca') {
    const result = await this.searchAccommodations({ Destino: query?.trim() || 'Cuenca', Pagina: 1, Limite: 10 })
    return result.items
  },

  async searchAccommodations(params = {}) {
    const { data } = await api.get(`${ENDPOINTS.PUBLIC.ACCOMMODATIONS}/search`, {
      params: stripEmpty({
        Destino: params.Destino || params.destino,
        fechaInicio: toApiDateTime(params.FechaEntrada || params.fechaInicio, '14:00:00'),
        fechaFin: toApiDateTime(params.FechaSalida || params.fechaFin, '12:00:00'),
        NumAdultos: params.NumAdultos || params.adultos,
        NumNinos: params.NumNinos || params.ninos,
        NumHabitaciones: params.NumHabitaciones || params.habitaciones,
        TipoAlojamiento: params.TipoAlojamiento || params.tipoAlojamiento,
        PrecioMin: params.PrecioMin || params.precioMin,
        PrecioMax: params.PrecioMax || params.precioMax,
        CategoriaViaje: params.CategoriaViaje || params.categoriaViaje,
        OrdenarPor: params.OrdenarPor || params.ordenarPor,
        Pagina: params.Pagina || params.pagina || 1,
        Limite: params.Limite || params.limite || 10,
      }),
    })
    return normalizePagedResponse(data)
  },

  async getAccommodation(id, params = {}) {
    const { data } = await api.get(`${ENDPOINTS.PUBLIC.ACCOMMODATIONS}/${id}`, {
      params: stripEmpty({
        fechaInicio: toApiDateTime(params.fechaInicio, '14:00:00'),
        fechaFin: toApiDateTime(params.fechaFin, '12:00:00'),
      }),
    })
    return normalizeEntity(data)
  },

  async getCategories() {
    const { data } = await api.get(`${ENDPOINTS.PUBLIC.ACCOMMODATIONS}/categories`)
    return normalizeList(data)
  },

  async getReviews(id) {
    const { data } = await api.get(`${ENDPOINTS.PUBLIC.ACCOMMODATIONS}/${id}/reviews`)
    return normalizeList(data)
  },

  async createPublicReservation(payload) {
    const { data } = await api.post(`${ENDPOINTS.PUBLIC.ACCOMMODATIONS}/reservas`, payload)
    return normalizeEntity(data)
  },
}
