export const CHECKOUT_STORAGE_KEY = 'alojamiento-checkout-draft'
export const PUBLIC_SEARCH_STORAGE_KEY = 'alojamiento-public-search'

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

const getImageUrl = (image) => {
  if (typeof image === 'string') return image
  return getValue(image, ['url', 'Url', 'urlImagen', 'UrlImagen', 'imagen', 'Imagen', 'imagenUrl', 'ImagenUrl'])
}

const getFirstImageUrl = (images) => asArray(images).map(getImageUrl).find(Boolean)

export const getImageUrls = (images) => asArray(images).map(getImageUrl).filter(Boolean)

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

const toDateInputValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (dateValue, days) => {
  const base = new Date(`${dateValue}T00:00:00`)
  base.setDate(base.getDate() + days)
  return toDateInputValue(base)
}

export const getDefaultDateRange = () => {
  const todayDate = new Date()
  const checkIn = toDateInputValue(todayDate)
  const checkOut = addDays(checkIn, 1)
  return { fechaInicio: checkIn, fechaFin: checkOut }
}

export const hydrateSearchDates = (search = {}) => {
  const defaults = getDefaultDateRange()
  const fechaInicio = search.fechaInicio || defaults.fechaInicio
  let fechaFin = search.fechaFin || defaults.fechaFin
  if (fechaFin <= fechaInicio) fechaFin = addDays(fechaInicio, 1)
  return { ...search, fechaInicio, fechaFin }
}

export const loadStoredSearch = () => {
  if (typeof window === 'undefined') return {}
  const fromSession = window.sessionStorage.getItem(PUBLIC_SEARCH_STORAGE_KEY)
  const fromLocal = window.localStorage.getItem(PUBLIC_SEARCH_STORAGE_KEY)
  const raw = fromSession || fromLocal
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const today = getDefaultDateRange().fechaInicio
    if (parsed.fechaFin && parsed.fechaFin < today) return {}
    return parsed
  } catch {
    return {}
  }
}

export const persistSearchState = (search = {}) => {
  if (typeof window === 'undefined') return
  const normalized = hydrateSearchDates(search)
  const payload = JSON.stringify(normalized)
  window.sessionStorage.setItem(PUBLIC_SEARCH_STORAGE_KEY, payload)
  window.localStorage.setItem(PUBLIC_SEARCH_STORAGE_KEY, payload)
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

const normalizeSearchText = (value = '') =>
  String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export const matchesAccommodationDestination = (item, destino = '') => {
  const needle = normalizeSearchText(destino)
  if (!needle) return true
  return normalizeSearchText(getAccommodationLocation(item)).includes(needle)
}

export const getAccommodationImage = (item) => {
  return getAccommodationImages(item)[0]
}

export const getAccommodationImages = (item) => {
  const imagenes = asArray(getValue(item, ['imagenes', 'Imagenes']))
  const roomImageUrls = new Set(
    getRoomTypes(item)
      .flatMap((roomType) => asArray(getValue(roomType, ['imagenes', 'Imagenes'])))
      .map(getImageUrl)
      .filter(Boolean)
  )
  const candidates = [
    getValue(item, [
    'imagenPrincipalUrl',
    'ImagenPrincipalUrl',
    'imagenPrincipal',
    'ImagenPrincipal',
    'imagenSucursalUrl',
    'ImagenSucursalUrl',
    'urlImagenSucursal',
    'UrlImagenSucursal',
    'imagen',
    'Imagen',
    'urlImagen',
    'UrlImagen',
    ]),
    ...imagenes.map(getImageUrl),
  ].filter(Boolean)

  return Array.from(new Set(candidates.filter((url) => !roomImageUrls.has(url))))
}

export const getRoomTypes = (detail) =>
  asArray(getValue(detail, ['tiposHabitacion', 'TiposHabitacion', 'habitaciones', 'Habitaciones']))

export const getRoomTypeGuid = (roomType) =>
  getValue(roomType, ['tipoHabitacionGuid', 'TipoHabitacionGuid', 'guid', 'id', 'Id'])

export const getRoomTypeName = (roomType) =>
  getValue(roomType, ['nombre', 'Nombre', 'nombreTipoHabitacion', 'NombreTipoHabitacion', 'tipo', 'Tipo'], 'Habitacion')

export const getRoomTypePrice = (roomType) =>
  Number(getValue(roomType, ['precioNocheAplicado', 'PrecioNocheAplicado', 'precioPorNoche', 'PrecioPorNoche', 'precioDesde', 'PrecioDesde', 'precioBase', 'PrecioBase', 'precio', 'Precio'], 0))

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
  return getValue(roomType, [
    'imagenPrincipalUrl',
    'ImagenPrincipalUrl',
    'imagenPrincipal',
    'ImagenPrincipal',
    'imagen',
    'Imagen',
    'urlImagen',
    'UrlImagen',
  ]) || getFirstImageUrl(getValue(roomType, ['imagenes', 'Imagenes']))
}

export const getRoomTypeImages = (roomType) => {
  const principal = getValue(roomType, [
    'imagenPrincipalUrl',
    'ImagenPrincipalUrl',
    'imagenPrincipal',
    'ImagenPrincipal',
    'imagen',
    'Imagen',
    'urlImagen',
    'UrlImagen',
  ])
  return Array.from(new Set([principal, ...getImageUrls(getValue(roomType, ['imagenes', 'Imagenes']))].filter(Boolean)))
}

export const buildSearchParamsFromUrl = (searchParams) => ({
  destino: searchParams.get('destino') || '',
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

export const mergeStoredSearchWithUrl = (searchParams) => {
  const fromUrl = buildSearchParamsFromUrl(searchParams)
  const stored = loadStoredSearch()
  const explicitUrlValues = {}

  Object.entries(fromUrl).forEach(([key, value]) => {
    if (searchParams.has(key) && value !== undefined && value !== null && value !== '') {
      explicitUrlValues[key] = value
    }
  })

  return hydrateSearchDates({
    adultos: 2,
    ninos: 0,
    habitaciones: 1,
    pagina: 1,
    ...stored,
    ...explicitUrlValues,
  })
}

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
