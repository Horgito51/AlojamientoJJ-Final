import { ENDPOINTS } from '../api/endpoints'

const active = { name: 'activo', type: 'checkbox', defaultValue: true }
const option = (value, label) => ({ value, label })
const select = (name, options, defaultValue = '', required = true) => ({ name, type: 'select', options, defaultValue, required })
const relation = (name, endpoint, valueKeys, labelKeys, required = true, valueType = 'number') => ({ name, type: 'relation', endpoint, valueKeys, labelKeys, required, valueType })

const activeState = [
  option('ACT', 'Activo'),
  option('INA', 'Inactivo'),
]

const roomState = [
  option('DIS', 'Disponible'),
  option('OCU', 'Ocupada'),
  option('MNT', 'Mantenimiento'),
  option('FDS', 'Fuera de servicio'),
  option('INA', 'Inactiva'),
]

const bookingState = [
  option('PEN', 'Pendiente'),
  option('CON', 'Confirmada'),
  option('CAN', 'Cancelada'),
  option('EXP', 'Expirada'),
  option('FIN', 'Finalizada'),
  option('EMI', 'En marcha'),
]

const stayState = [
  option('ACT', 'Activa'),
  option('FIN', 'Finalizada'),
  option('CAN', 'Cancelada'),
]

const invoiceState = [
  option('EMI', 'Emitida'),
  option('PAG', 'Pagada'),
  option('ANU', 'Anulada'),
]

const paymentState = [
  option('PEN', 'Pendiente'),
  option('PRO', 'Procesando'),
  option('APR', 'Aprobado'),
  option('REC', 'Rechazado'),
  option('CAN', 'Cancelado'),
]

const reviewState = [
  option('PEN', 'Pendiente'),
  option('PUB', 'Publicada'),
  option('OCU', 'Oculta'),
  option('REP', 'Reportada'),
]

const userState = [
  option('ACT', 'Activo'),
  option('INA', 'Inactivo'),
  option('BLO', 'Bloqueado'),
]

const accommodationTypes = [
  option('hotel', 'Hotel'),
  option('hostal', 'Hostal'),
  option('apartamento', 'Apartamento'),
  option('resort', 'Resort'),
  option('villa', 'Villa'),
  option('cabana', 'Cabana'),
  option('hostel', 'Hostel'),
]

const tripCategories = [
  option('playa', 'Playa'),
  option('ciudad', 'Ciudad'),
  option('montana', 'Montana'),
  option('aventura', 'Aventura'),
  option('cultural', 'Cultural'),
  option('bienestar', 'Bienestar'),
]

const bedTypes = [
  option('individual', 'Individual'),
  option('matrimonial', 'Matrimonial'),
  option('queen', 'Queen'),
  option('king', 'King'),
  option('doble', 'Doble'),
  option('literas', 'Literas'),
  option('sofa-cama', 'Sofa cama'),
]

const catalogTypes = [
  option('AME', 'Amenidad incluida'),
  option('SRV', 'Servicio adicional'),
]

const catalogCategories = [
  option('habitacion', 'Habitacion'),
  option('alimentos', 'Alimentos y bebidas'),
  option('transporte', 'Transporte'),
  option('bienestar', 'Bienestar'),
  option('limpieza', 'Limpieza'),
  option('entretenimiento', 'Entretenimiento'),
]

const identificationTypes = [
  option('CED', 'Cedula'),
  option('RUC', 'RUC'),
  option('PAS', 'Pasaporte'),
]

const rateChannels = [
  option('TODOS', 'Todos los canales'),
  option('PORTAL', 'Portal publico'),
  option('ADMIN', 'Panel administrativo'),
  option('API', 'Integracion API'),
  option('WALKIN', 'Walk-in'),
]

const bookingOrigins = [
  option('WEB', 'Web'),
  option('ADMIN', 'Panel Administrativo'),
  option('API', 'API'),
  option('PHONE', 'Telefono'),
]

const paymentMethods = [
  option('EFECTIVO', 'Efectivo'),
  option('TARJETA', 'Tarjeta'),
  option('TRANSFERENCIA', 'Transferencia'),
  option('PAYPAL', 'PayPal'),
  option('PASARELA', 'Pasarela de pago'),
]

const currencies = [
  option('USD', 'Dolar estadounidense'),
]

export const adminNavigation = [
  { to: '/admin', label: 'Dashboard', group: 'Inicio' },
  { to: '/admin/sucursales', label: 'Sucursales', group: 'Alojamiento' },
  { to: '/admin/tipos-habitacion', label: 'Tipos', group: 'Alojamiento' },
  { to: '/admin/habitaciones', label: 'Habitaciones', group: 'Alojamiento' },
  { to: '/admin/tarifas', label: 'Tarifas', group: 'Alojamiento' },
  { to: '/admin/servicios', label: 'Servicios', group: 'Alojamiento' },
  { to: '/admin/clientes', label: 'Clientes', group: 'Reservas' },
  { to: '/admin/reservas', label: 'Reservas', group: 'Reservas' },
  { to: '/admin/estadias', label: 'Estadias', group: 'Hospedaje' },
  { to: '/admin/facturas', label: 'Facturas', group: 'Facturacion' },
  { to: '/admin/pagos', label: 'Pagos', group: 'Facturacion' },
  { to: '/admin/usuarios', label: 'Usuarios', group: 'Seguridad' },
  { to: '/admin/roles', label: 'Roles', group: 'Seguridad' },
  { to: '/admin/auditoria', label: 'Auditoria', group: 'Seguridad' },
  { to: '/admin/valoraciones', label: 'Valoraciones', group: 'Experiencia' },
]

const text = (name, required = true) => ({ name, type: 'text', required })
const textarea = (name, required = false) => ({ name, type: 'textarea', required, layout: 'wide' })
const number = (name, required = true) => ({ name, type: 'number', required })
const numberWithDefault = (name, defaultValue, required = true) => ({ name, type: 'number', defaultValue, required })
const money = (name, required = true) => ({ name, type: 'number', step: '0.01', required })
const date = (name) => ({ name, type: 'date', required: true })
const checkbox = (name, defaultValue = false) => ({ name, type: 'checkbox', defaultValue })
const image = (name, required = false) => ({ name, type: 'image', required })

const imagePayload = (payload) => {
  const existingImages = Array.isArray(payload.imagenes) ? payload.imagenes : Array.isArray(payload.Imagenes) ? payload.Imagenes : []
  const principalUrl = payload.imagenPrincipalUrl || payload.urlImagen || payload.imagenUrl || ''
  const secondaryUrls = [payload.imagenSecundariaUrl].filter(Boolean)
  const imagenes = principalUrl || secondaryUrls.length
    ? [
        ...(principalUrl ? [{
          imagenGuid: payload.imagenGuid || payload.ImagenGuid || '00000000-0000-0000-0000-000000000000',
          urlImagen: principalUrl,
          descripcion: payload.descripcionImagen || payload.descripcionCorta || payload.descripcion || '',
          orden: 1,
          esPrincipal: true,
        }] : []),
        ...secondaryUrls.map((url, index) => ({
          imagenGuid: '00000000-0000-0000-0000-000000000000',
          urlImagen: url,
          descripcion: payload.descripcionImagen || payload.descripcion || '',
          orden: index + 2,
          esPrincipal: false,
        })),
      ]
    : existingImages

  const rest = { ...payload }
  delete rest.imagenPrincipalUrl
  delete rest.imagenSecundariaUrl
  delete rest.urlImagen
  delete rest.imagenUrl
  delete rest.descripcionImagen
  delete rest.imagenGuid
  delete rest.ImagenGuid
  delete rest.imagenes
  delete rest.Imagenes

  return {
    ...rest,
    imagenes,
  }
}

export const adminModules = {
  sucursales: {
    title: 'Sucursales',
    endpoint: ENDPOINTS.INTERNAL.SUCURSALES,
    idKeys: ['idSucursal', 'IdSucursal'],
    columns: ['imagenPrincipalUrl', 'codigoSucursal', 'nombreSucursal', 'ciudad', 'telefono', 'estadoSucursal'],
    fields: [
      text('codigoSucursal'),
      text('nombreSucursal'),
      image('imagenPrincipalUrl', false),
      textarea('descripcionSucursal'),
      textarea('descripcionCorta'),
      select('tipoAlojamiento', accommodationTypes, 'hotel'),
      number('estrellas', false),
      select('categoriaViaje', tripCategories, '', false),
      text('pais'),
      text('provincia', false),
      text('ciudad'),
      text('ubicacion', false),
      text('direccion'),
      text('codigoPostal', false),
      text('telefono'),
      text('correo'),
      number('latitud', false),
      number('longitud', false),
      text('horaCheckin', false),
      text('horaCheckout', false),
      checkbox('checkinAnticipado'),
      checkbox('checkoutTardio'),
      checkbox('aceptaNinos', true),
      numberWithDefault('edadMinimaHuesped', 18, false),
      checkbox('permiteMascotas'),
      checkbox('sePermiteFumar'),
      select('estadoSucursal', activeState, 'ACT'),
    ],
    transformPayload: imagePayload,
  },
  'tipos-habitacion': {
    title: 'Tipos de habitacion',
    endpoint: ENDPOINTS.INTERNAL.TIPOS_HABITACION,
    idKeys: ['idTipoHabitacion', 'IdTipoHabitacion'],
    columns: ['imagenPrincipalUrl', 'codigoTipoHabitacion', 'nombreTipoHabitacion', 'capacidadTotal', 'tipoCama', 'estadoTipoHabitacion'],
    fields: [
      text('codigoTipoHabitacion'),
      text('nombreTipoHabitacion'),
      image('imagenPrincipalUrl', false),
      image('imagenSecundariaUrl', false),
      textarea('descripcion'),
      number('capacidadAdultos'),
      number('capacidadNinos'),
      number('capacidadTotal'),
      select('tipoCama', bedTypes, '', false),
      money('areaM2'),
      checkbox('permiteEventos'),
      checkbox('permiteReservaPublica', true),
      select('estadoTipoHabitacion', activeState, 'ACT'),
    ],
    transformPayload: imagePayload,
  },
  habitaciones: {
    title: 'Habitaciones',
    endpoint: ENDPOINTS.INTERNAL.HABITACIONES,
    idKeys: ['idHabitacion', 'IdHabitacion'],
    columns: ['numeroHabitacion', 'idSucursal', 'idTipoHabitacion', 'precioBase', 'estadoHabitacion'],
    fields: [
      relation('idSucursal', ENDPOINTS.INTERNAL.SUCURSALES, ['idSucursal', 'IdSucursal', 'id'], ['nombreSucursal', 'codigoSucursal']),
      relation('idTipoHabitacion', ENDPOINTS.INTERNAL.TIPOS_HABITACION, ['idTipoHabitacion', 'IdTipoHabitacion', 'id'], ['nombreTipoHabitacion', 'codigoTipoHabitacion']),
      text('numeroHabitacion'),
      number('piso', false),
      number('capacidadHabitacion'),
      money('precioBase'),
      textarea('descripcionHabitacion'),
      select('estadoHabitacion', roomState, 'DIS'),
    ],
  },
  tarifas: {
    title: 'Tarifas',
    endpoint: ENDPOINTS.INTERNAL.TARIFAS,
    idKeys: ['idTarifa', 'IdTarifa'],
    columns: ['codigoTarifa', 'nombreTarifa', 'precioPorNoche', 'canalTarifa', 'estadoTarifa'],
    fields: [
      text('codigoTarifa'),
      relation('idSucursal', ENDPOINTS.INTERNAL.SUCURSALES, ['idSucursal', 'IdSucursal', 'id'], ['nombreSucursal', 'codigoSucursal']),
      relation('idTipoHabitacion', ENDPOINTS.INTERNAL.TIPOS_HABITACION, ['idTipoHabitacion', 'IdTipoHabitacion', 'id'], ['nombreTipoHabitacion', 'codigoTipoHabitacion']),
      text('nombreTarifa'),
      select('canalTarifa', rateChannels, 'TODOS'),
      date('fechaInicio'),
      date('fechaFin'),
      money('precioPorNoche'),
      money('porcentajeIva'),
      number('minNoches'),
      number('maxNoches', false),
      checkbox('permitePortalPublico', true),
      number('prioridad'),
      select('estadoTarifa', activeState, 'ACT'),
    ],
  },
  servicios: {
    title: 'Catalogo de servicios',
    endpoint: ENDPOINTS.INTERNAL.CATALOGO_SERVICIOS,
    idKeys: ['idCatalogo', 'IdCatalogo'],
    columns: ['codigoCatalogo', 'nombreCatalogo', 'tipoCatalogo', 'precioBase', 'estadoCatalogo'],
    fields: [
      relation('idSucursal', ENDPOINTS.INTERNAL.SUCURSALES, ['idSucursal', 'IdSucursal', 'id'], ['nombreSucursal', 'codigoSucursal'], false),
      text('codigoCatalogo'),
      text('nombreCatalogo'),
      select('tipoCatalogo', catalogTypes, 'SRV'),
      select('categoriaCatalogo', catalogCategories, '', false),
      textarea('descripcionCatalogo'),
      money('precioBase'),
      checkbox('aplicaIva', true),
      checkbox('disponible24h'),
      text('horaInicio', false),
      text('horaFin', false),
      text('iconoUrl', false),
      select('estadoCatalogo', activeState, 'ACT'),
    ],
  },
  clientes: {
    title: 'Clientes',
    endpoint: ENDPOINTS.INTERNAL.CLIENTES,
    idKeys: ['idCliente', 'IdCliente'],
    columns: ['numeroIdentificacion', 'nombres', 'apellidos', 'correo', 'estado'],
    fields: [
      select('tipoIdentificacion', identificationTypes, 'CED'),
      text('numeroIdentificacion'),
      text('nombres'),
      text('apellidos'),
      text('razonSocial', false),
      text('correo'),
      text('telefono'),
      text('direccion', false),
      select('estado', activeState, 'ACT'),
    ],
    updatePayloadFields: ['nombres', 'apellidos', 'razonSocial', 'correo', 'telefono', 'direccion', 'estado'],
  },
  reservas: {
    title: 'Reservas',
    endpoint: ENDPOINTS.INTERNAL.RESERVAS,
    idKeys: ['idReserva', 'IdReserva'],
    columns: ['idCliente', 'idSucursal', 'fechaInicio', 'fechaFin', 'totalReserva', 'estadoReserva'],
    fields: [
      { ...relation('clienteGuid', ENDPOINTS.INTERNAL.CLIENTES, ['clienteGuid', 'ClienteGuid', 'guidCliente', 'GuidCliente'], ['nombres', 'apellidos', 'numeroIdentificacion'], true, 'string'), modes: ['create'] },
      { ...relation('sucursalGuid', ENDPOINTS.INTERNAL.SUCURSALES, ['sucursalGuid', 'SucursalGuid', 'guidSucursal', 'GuidSucursal'], ['nombreSucursal', 'codigoSucursal'], true, 'string'), modes: ['create'] },
      { ...relation('tipoHabitacionGuid', ENDPOINTS.INTERNAL.TIPOS_HABITACION, ['tipoHabitacionGuid', 'TipoHabitacionGuid', 'guidTipoHabitacion', 'GuidTipoHabitacion'], ['nombreTipoHabitacion', 'codigoTipoHabitacion'], true, 'string'), modes: ['create'] },
      date('fechaInicio'),
      date('fechaFin'),
      { ...number('numHabitaciones'), modes: ['create'] },
      { ...number('numAdultos'), modes: ['create'] },
      { ...number('numNinos', false), modes: ['create'] },
      number('descuentoAplicado', false),
      { ...money('subtotalReserva', false), modes: ['update'] },
      { ...money('valorIva', false), modes: ['update'] },
      { ...money('totalReserva', false), modes: ['update'] },
      { ...money('saldoPendiente', false), modes: ['update'] },
      select('origenCanalReserva', bookingOrigins, 'ADMIN'),
      { ...select('estadoReserva', bookingState, 'PEN'), modes: ['update'] },
      textarea('observaciones'),
      checkbox('esWalkin', false),
    ],
    defaults: { numHabitaciones: 1, numAdultos: 1, numNinos: 0, descuentoAplicado: 0 },
    createPayloadFields: ['clienteGuid', 'sucursalGuid', 'fechaInicio', 'fechaFin', 'descuentoAplicado', 'observaciones', 'esWalkin', 'origenCanalReserva', 'habitaciones'],
    updatePayloadFields: ['fechaInicio', 'fechaFin', 'subtotalReserva', 'valorIva', 'totalReserva', 'descuentoAplicado', 'saldoPendiente', 'estadoReserva', 'observaciones'],
    transformPayload: (payload, mode) => {
      if (mode === 'update') return payload
      const { tipoHabitacionGuid, numHabitaciones, numAdultos, numNinos, descuentoLinea, ...rest } = payload
      return {
        ...rest,
        habitaciones: [{
          tipoHabitacionGuid,
          numHabitaciones: Number(numHabitaciones) || 1,
          numAdultos: Number(numAdultos) || 1,
          numNinos: Number(numNinos) || 0,
          descuentoLinea: Number(descuentoLinea) || 0,
        }],
      }
    },
    actions: ['confirmarReserva', 'cancelarReserva', 'ejecutarPago'],
  },
  estadias: {
    title: 'Estadias',
    endpoint: ENDPOINTS.INTERNAL.ESTADIAS,
    idKeys: ['idEstadia', 'IdEstadia'],
    columns: ['idReserva', 'checkinUtc', 'checkoutUtc', 'estadoEstadia'],
    fields: [select('estadoEstadia', stayState, 'ACT')],
    readonly: true,
    actions: ['checkout'],
  },
  facturas: {
    title: 'Facturas',
    endpoint: ENDPOINTS.INTERNAL.FACTURAS,
    idKeys: ['idFactura', 'IdFactura'],
    columns: ['idReserva', 'numeroFactura', 'total', 'estado'],
    fields: [select('estado', invoiceState, 'EMI')],
    readonly: true,
    actions: ['anularFactura'],
  },
  pagos: {
    title: 'Pagos',
    endpoint: ENDPOINTS.INTERNAL.PAGOS,
    idKeys: ['idPago', 'IdPago'],
    columns: ['idFactura', 'idReserva', 'monto', 'metodoPago', 'estadoPago'],
    fields: [
      relation('idFactura', ENDPOINTS.INTERNAL.FACTURAS, ['idFactura', 'IdFactura', 'id'], ['numeroFactura']),
      relation('idReserva', ENDPOINTS.INTERNAL.RESERVAS, ['idReserva', 'IdReserva', 'id'], ['idReserva', 'IdReserva']),
      money('monto'),
      select('metodoPago', paymentMethods, 'EFECTIVO'),
      checkbox('esPagoElectronico'),
      text('proveedorPasarela', false),
      text('transaccionExterna', false),
      text('codigoAutorizacion', false),
      text('referencia', false),
      select('estadoPago', paymentState, 'PEN'),
      select('moneda', currencies, 'USD'),
      money('tipoCambio'),
      textarea('respuestaPasarela'),
    ],
    defaults: { moneda: 'USD', tipoCambio: 1, fechaPagoUtc: () => new Date().toISOString() },
  },
  usuarios: {
    title: 'Usuarios',
    endpoint: ENDPOINTS.INTERNAL.USUARIOS,
    idKeys: ['idUsuario', 'IdUsuario'],
    columns: ['username', 'correo', 'nombres', 'apellidos', 'estadoUsuario'],
    fields: [
      relation('idCliente', ENDPOINTS.INTERNAL.CLIENTES, ['idCliente', 'IdCliente', 'id'], ['nombres', 'apellidos', 'numeroIdentificacion'], false),
      text('username'),
      text('correo'),
      text('nombres'),
      text('apellidos'),
      select('estadoUsuario', userState, 'ACT'),
      active,
      relation('idRol', ENDPOINTS.INTERNAL.ROLES, ['idRol', 'IdRol', 'id'], ['nombreRol'], false),
      text('roles', false),
    ],
    transformPayload: (payload, mode) => ({
      ...payload,
      roles: String(payload.roles || '')
        .split(',')
        .map((id) => Number(id.trim()))
        .filter(Boolean)
        .map((id) => (mode === 'update' ? { idRol: id } : id)),
    }),
    updatePayloadFields: ['correo', 'nombres', 'apellidos', 'estadoUsuario', 'activo', 'roles'],
  },
  roles: {
    title: 'Roles',
    endpoint: ENDPOINTS.INTERNAL.ROLES,
    idKeys: ['idRol', 'IdRol'],
    columns: ['nombreRol', 'descripcionRol', 'estadoRol', 'activo'],
    fields: [text('nombreRol'), textarea('descripcionRol'), select('estadoRol', activeState, 'ACT'), active],
  },
  auditoria: {
    title: 'Auditoria',
    endpoint: ENDPOINTS.INTERNAL.AUDITORIA,
    idKeys: ['idAuditoria', 'IdAuditoria', 'auditoriaGuid'],
    columns: ['tabla', 'accion', 'usuario', 'fechaUtc'],
    readonly: true,
  },
  valoraciones: {
    title: 'Valoraciones',
    endpoint: ENDPOINTS.INTERNAL.VALORACIONES,
    idKeys: ['idValoracion', 'IdValoracion'],
    columns: ['idCliente', 'idSucursal', 'puntuacionLimpieza', 'estadoValoracion'],
    fields: [select('estadoValoracion', reviewState, 'PEN')],
    readonly: true,
    actions: ['moderarValoracion', 'responderValoracion'],
  },
}
