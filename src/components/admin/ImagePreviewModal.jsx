import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function ImagePreviewModal({ images = [], initialIndex = 0, title = 'Vista de imagen', onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const cleanImages = images.filter(Boolean)
  const safeIndex = cleanImages.length > 0 ? Math.min(index, cleanImages.length - 1) : 0
  const image = cleanImages[safeIndex]
  const hasGallery = cleanImages.length > 1

  useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!image) return null

  const goPrevious = () => setIndex((current) => (current - 1 + cleanImages.length) % cleanImages.length)
  const goNext = () => setIndex((current) => (current + 1) % cleanImages.length)

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Cerrar vista de imagen" />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3">
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            {hasGallery && <p className="text-xs text-slate-400">Imagen {safeIndex + 1} de {cleanImages.length}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 text-lg font-bold text-white transition hover:bg-slate-800"
            aria-label="Cerrar"
          >
            X
          </button>
        </div>

        <div className="relative flex min-h-[320px] items-center justify-center bg-slate-950 p-3">
          <img src={image} alt={title} className="max-h-[74vh] w-auto max-w-full rounded-md object-contain" />

          {hasGallery && (
            <>
              <button
                type="button"
                onClick={goPrevious}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-900 shadow-md transition hover:bg-white"
                aria-label="Imagen anterior"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-900 shadow-md transition hover:bg-white"
                aria-label="Siguiente imagen"
              >
                &gt;
              </button>
            </>
          )}
        </div>

        {hasGallery && (
          <div className="flex gap-2 overflow-x-auto border-t border-slate-800 p-3">
            {cleanImages.map((item, itemIndex) => (
              <button
                key={`${item}-${itemIndex}`}
                type="button"
                onClick={() => setIndex(itemIndex)}
                className={[
                  'h-16 w-24 flex-none overflow-hidden rounded-md border transition',
                  itemIndex === safeIndex ? 'border-indigo-400 ring-2 ring-indigo-400/40' : 'border-slate-700 opacity-70 hover:opacity-100',
                ].join(' ')}
                aria-label={`Ver imagen ${itemIndex + 1}`}
              >
                <img src={item} alt={`Miniatura ${itemIndex + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
