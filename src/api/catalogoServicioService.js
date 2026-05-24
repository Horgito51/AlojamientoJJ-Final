import { asArray, getValue } from '../utils/accommodation'

export const catalogoServicioService = {
  getServiciosSucursal: (detail) => asArray(getValue(detail, ['serviciosDestacados', 'ServiciosDestacados'])),
  getAmenidadesSucursal: (detail) => asArray(getValue(detail, ['amenities', 'Amenities'])),
  getAmenidadesTipoHabitacion: (roomType) => asArray(getValue(roomType, ['amenities', 'Amenities', 'amenidades', 'Amenidades'])),
  getServiciosTipoHabitacion: (roomType) => asArray(getValue(roomType, ['servicios', 'Servicios', 'serviciosIncluidos', 'ServiciosIncluidos'])),
}

