export const CHECKOUT_STORAGE_KEY = 'alojamiento-checkout-draft'

export const getValue = (source, keys, fallback = undefined) => {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return fallback
}

export const asArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.$values)) return value.$values
  return []
}

export const formatMoney = (value, currency = 'USD') =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value || 0))

export const getNights = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0
  const start = new Date(`${fechaInicio}T00:00:00`)
  const end = new Date(`${fechaFin}T00:00:00`)
  const diff = Math.ceil((end - start) / 86400000)
  return diff > 0 ? diff : 0
}

export const getAccommodationGuid = (item) =>
  getValue(item, ['sucursalGuid', 'SucursalGuid', 'guid', 'id', 'Id'])

export const getAccommodationTitle = (item) =>
  getValue(item, ['nombre', 'Nombre', 'nombreSucursal', 'NombreSucursal', 'titulo', 'name'], 'Alojamiento JJ')

export const getAccommodationLocation = (item) =>
  [
    getValue(item, ['ciudad', 'Ciudad']),
    getValue(item, ['provincia', 'Provincia']),
    getValue(item, ['pais', 'Pais']),
  ].filter(Boolean).join(', ') ||
  getValue(item, ['ubicacion', 'Ubicacion', 'direccion', 'Direccion'], 'Cuenca, Ecuador')

export const getAccommodationImage = (item) => {
  const imagenes = asArray(getValue(item, ['imagenes', 'Imagenes']))
  return getValue(item, [
    'imagenPrincipalUrl',
    'ImagenPrincipalUrl',
    'imagenPrincipal',
    'ImagenPrincipal',
    'imagen',
    'Imagen',
    'urlImagen',
    'UrlImagen',
  ]) || getValue(imagenes[0], ['url', 'Url', 'urlImagen', 'UrlImagen', 'imagen', 'Imagen'])
}

export const getRoomTypes = (detail) =>
  asArray(getValue(detail, ['tiposHabitacion', 'TiposHabitacion', 'habitaciones', 'Habitaciones']))

export const getRoomTypeGuid = (roomType) =>
  getValue(roomType, ['tipoHabitacionGuid', 'TipoHabitacionGuid', 'guid', 'id', 'Id'])

export const getRoomTypeName = (roomType) =>
  getValue(roomType, ['nombre', 'Nombre', 'nombreTipoHabitacion', 'NombreTipoHabitacion', 'tipo', 'Tipo'], 'Habitacion')

export const getRoomTypePrice = (roomType) =>
  Number(getValue(roomType, ['precioBase', 'PrecioBase', 'precioDesde', 'PrecioDesde', 'precio', 'Precio'], 0))

export const getRoomTypeAdults = (roomType) =>
  Number(getValue(roomType, ['capacidadAdultos', 'CapacidadAdultos', 'adultos', 'Adultos'], 1))

export const getRoomTypeChildren = (roomType) =>
  Number(getValue(roomType, ['capacidadNinos', 'CapacidadNinos', 'ninos', 'Ninos'], 0))

export const getRoomTypeCapacity = (roomType) => {
  const explicit = getValue(roomType, ['capacidadTotal', 'CapacidadTotal', 'capacidad', 'Capacidad', 'capacidadHabitacion', 'CapacidadHabitacion'])
  if (explicit !== undefined) return Number(explicit)
  return getRoomTypeAdults(roomType) + getRoomTypeChildren(roomType)
}

export const getRoomTypeAvailable = (roomType) =>
  Number(getValue(roomType, ['disponiblesEnRango', 'DisponiblesEnRango', 'disponibles', 'Disponibles', 'cantidadDisponible'], 0))

export const getRoomTypeImage = (roomType) => {
  const imagenes = asArray(getValue(roomType, ['imagenes', 'Imagenes']))
  return getValue(roomType, ['imagen', 'Imagen', 'urlImagen', 'UrlImagen']) ||
    getValue(imagenes[0], ['url', 'Url', 'urlImagen', 'UrlImagen', 'imagen', 'Imagen'])
}

export const buildSearchParamsFromUrl = (searchParams) => ({
  destino: searchParams.get('destino') || 'Cuenca',
  fechaInicio: searchParams.get('fechaInicio') || '',
  fechaFin: searchParams.get('fechaFin') || '',
  adultos: Number(searchParams.get('adultos') || 2),
  ninos: Number(searchParams.get('ninos') || 0),
  habitaciones: Number(searchParams.get('habitaciones') || 1),
  precioMin: searchParams.get('precioMin') || '',
  precioMax: searchParams.get('precioMax') || '',
  ordenarPor: searchParams.get('ordenarPor') || '',
  pagina: Number(searchParams.get('pagina') || 1),
  tipoAlojamiento: searchParams.get('tipoAlojamiento') || '',
  categoriaViaje: searchParams.get('categoriaViaje') || '',
})

export const toApiDateTime = (dateValue, time = '12:00:00') => {
  if (!dateValue) return ''
  if (String(dateValue).includes('T')) return dateValue
  return new Date(`${dateValue}T${time}`).toISOString()
}

export const getHttpErrorMessage = (error, fallback = 'No se pudo completar la solicitud.') => {
  const status = error?.response?.status
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.Message ||
    error?.response?.data?.detail ||
    error?.message

  if (status === 400) return backendMessage || 'Los datos enviados son invalidos o estan incompletos.'
  if (status === 401) return 'Tu sesion expiro o falta autenticacion.'
  if (status === 403) return 'No tienes permisos para realizar esta accion.'
  if (status === 404) return 'No se encontraron datos para la solicitud realizada.'
  if (status === 409) return 'La cantidad solicitada ya no esta disponible para las fechas seleccionadas.'
  if (status === 500) return 'Ocurrio un error interno. Intenta nuevamente en unos minutos.'
  return backendMessage || fallback
}
