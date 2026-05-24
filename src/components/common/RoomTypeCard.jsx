import { useState } from 'react'
import {
  asArray,
  formatMoney,
  getRoomTypeAdults,
  getRoomTypeAvailable,
  getRoomTypeCapacity,
  getRoomTypeChildren,
  getRoomTypeGuid,
  getRoomTypeImage,
  getRoomTypeImages,
  getRoomTypeName,
  getRoomTypePrice,
  getValue,
} from '../../utils/accommodation'

export default function RoomTypeCard({ roomType, quantity = 0, onQuantityChange }) {
  const guid = getRoomTypeGuid(roomType)
  const available = getRoomTypeAvailable(roomType)
  const images = getRoomTypeImages(roomType)
  const [imageIndex, setImageIndex] = useState(0)
  const image = images[imageIndex] || getRoomTypeImage(roomType)
  const amenities = asArray(getValue(roomType, ['amenities', 'Amenities', 'amenidades', 'Amenidades']))
  const services = asArray(getValue(roomType, ['servicios', 'Servicios', 'serviciosIncluidos', 'ServiciosIncluidos']))
  const hasGallery = images.length > 1
  const goToPreviousImage = () => setImageIndex((current) => (current === 0 ? images.length - 1 : current - 1))
  const goToNextImage = () => setImageIndex((current) => (current + 1) % images.length)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-[180px_1fr_150px]">
        <div className="relative h-36 overflow-hidden rounded-md bg-slate-200 dark:bg-slate-800">
          {image ? (
            <img src={image} alt={getRoomTypeName(roomType)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">Sin imagen</div>
          )}
          {hasGallery && (
            <>
              <button
                type="button"
                onClick={goToPreviousImage}
                className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white"
                aria-label="Imagen anterior"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={goToNextImage}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white"
                aria-label="Siguiente imagen"
              >
                &gt;
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {images.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={[
                      'h-2 w-2 rounded-full ring-1 ring-white/80 transition',
                      index === imageIndex ? 'bg-white' : 'bg-white/45',
                    ].join(' ')}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{getRoomTypeName(roomType)}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {getValue(roomType, ['descripcion', 'Descripcion'], 'Habitacion equipada para una estancia confortable.')}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>{getRoomTypeAdults(roomType)} adultos</span>
            <span>{getRoomTypeChildren(roomType)} ninos</span>
            <span>{getRoomTypeCapacity(roomType)} huespedes</span>
            {getValue(roomType, ['tipoCama', 'TipoCama']) && <span>{getValue(roomType, ['tipoCama', 'TipoCama'])}</span>}
            {getValue(roomType, ['areaM2', 'AreaM2']) && <span>{getValue(roomType, ['areaM2', 'AreaM2'])} m2</span>}
          </div>
          {(amenities.length > 0 || services.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {amenities.slice(0, 4).map((item) => (
                <span key={`a-${item}`} className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{String(item)}</span>
              ))}
              {services.slice(0, 3).map((item) => (
                <span key={`s-${item}`} className="rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">{String(item)}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-3">
          <div className="text-right md:text-left">
            <p className="text-xs text-slate-500">Por noche</p>
            <p className="text-xl font-bold text-slate-950 dark:text-white">{formatMoney(getRoomTypePrice(roomType))}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{available} disponibles</p>
          </div>
          <select
            value={quantity}
            onChange={(event) => onQuantityChange(guid, Number(event.target.value))}
            disabled={available <= 0}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
            aria-label={`Cantidad para ${getRoomTypeName(roomType)}`}
          >
            {Array.from({ length: Math.max(available, 0) + 1 }, (_, option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </article>
  )
}
