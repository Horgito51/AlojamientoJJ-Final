import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../../api/adminApi'
import { adminModules } from '../../data/adminModules'
import { buildFormFromRow, buildInitialForm, coercePayload, getFieldLabel, getOptionLabel, getOptionValue, readValue } from '../../utils/adminModule'
import { getErrorMessage, showError, showSuccess } from '../../utils/sweetAlert'
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload'
import { EMAIL_REGEX, PHONE_10_REGEX, isAdult, validateEcuadorIdentification } from '../../utils/validation'

export default function AdminModuleFormPage() {
  const { moduleKey, recordId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const module = adminModules[moduleKey]
  const isEdit = Boolean(recordId)
  const initialRow = location.state?.row
  const [form, setForm] = useState(() => initialRow && module ? buildFormFromRow(module, initialRow) : buildInitialForm(module || {}))
  const [loading, setLoading] = useState(isEdit && !initialRow)
  const [relationOptions, setRelationOptions] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageFiles, setImageFiles] = useState({})
  const [imagePreviews, setImagePreviews] = useState({})
  const previewUrlsRef = useRef({})
  const { upload, uploading, uploadError } = useCloudinaryUpload()

  const title = useMemo(() => {
    if (!module) return 'Modulo no encontrado'
    return `${isEdit ? 'Editar' : 'Crear'} ${module.title}`
  }, [isEdit, module])
  const visibleFields = useMemo(() => {
    const mode = isEdit ? 'update' : 'create'
    return module?.fields?.filter((field) => !field.modes || field.modes.includes(mode)) || []
  }, [isEdit, module])
  const relationFields = useMemo(() => visibleFields.filter((field) => field.type === 'relation'), [visibleFields])
  const loadingRelations = relationFields.some((field) => !relationOptions[field.name])

  const revokePreviewValue = (value) => {
    if (Array.isArray(value)) value.forEach((url) => URL.revokeObjectURL(url))
    else if (value) URL.revokeObjectURL(value)
  }

  useEffect(() => {
    const previewUrls = previewUrlsRef.current
    return () => {
      Object.values(previewUrls).forEach(revokePreviewValue)
    }
  }, [])

  useEffect(() => {
    if (!module || module.readonly || !isEdit || initialRow) return

    let alive = true
    adminApi.get(module.endpoint, recordId)
      .then((data) => {
        if (alive) setForm(buildFormFromRow(module, data))
      })
      .catch(() => {
        if (alive) setError('No se pudo cargar el registro para editar.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [initialRow, isEdit, module, recordId])

  useEffect(() => {
    if (relationFields.length === 0) return

    let alive = true
    Promise.all(
      relationFields.map((field) =>
        adminApi.list(field.endpoint)
          .then((items) => {
            const options = items.map((item) => {
              const value = field.valueKeys.map((key) => readValue(item, key)).find((itemValue) => itemValue !== '')
              const labelParts = field.labelKeys.map((key) => readValue(item, key)).filter(Boolean)
              return {
                value,
                label: labelParts.length ? labelParts.join(' - ') : String(value),
              }
            }).filter((option) => option.value !== undefined && option.value !== null && option.value !== '')
            return [field.name, options]
          })
          .catch(() => [field.name, []]),
      ),
    )
      .then((entries) => {
        if (alive) setRelationOptions(Object.fromEntries(entries))
      })

    return () => {
      alive = false
    }
  }, [relationFields])

  if (!module) {
    return <div className="rounded-lg bg-white p-6 dark:bg-slate-900">Modulo no encontrado.</div>
  }

  if (module.readonly) {
    return (
      <div className="rounded-lg bg-white p-6 dark:bg-slate-900">
        <p>Este modulo es solo de lectura.</p>
        <Link to={`/admin/${moduleKey}`} className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
          Volver
        </Link>
      </div>
    )
  }

  const formatNumber = (value) => {
    const numberValue = Number(value)
    return Number.isNaN(numberValue) ? 0 : numberValue
  }

  const updateForm = (event) => {
    const { name, value, type, checked, multiple, selectedOptions } = event.target

    setForm((current) => {
      const updatedValue = multiple ? Array.from(selectedOptions).map((opt) => opt.value) : type === 'checkbox' ? checked : value
      const nextForm = { ...current, [name]: updatedValue }

      if (moduleKey === 'tipos-habitacion') {
        if (name === 'capacidadAdultos' || name === 'capacidadNinos') {
          const adultos = formatNumber(nextForm.capacidadAdultos)
          const ninos = formatNumber(nextForm.capacidadNinos)
          nextForm.capacidadTotal = adultos + ninos
        }
      }

      return nextForm
    })
  }

  const handleFileChange = (fieldName, event) => {
    const file = event.target.files[0]
    if (!file) return

    if (previewUrlsRef.current[fieldName]) {
      revokePreviewValue(previewUrlsRef.current[fieldName])
    }

    const previewUrl = URL.createObjectURL(file)
    previewUrlsRef.current[fieldName] = previewUrl

    setImageFiles((prev) => ({ ...prev, [fieldName]: file }))
    setImagePreviews((prev) => ({ ...prev, [fieldName]: previewUrl }))
  }

  const handleImageListChange = (fieldName, event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const items = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID?.() || Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    previewUrlsRef.current[fieldName] = [
      ...(Array.isArray(previewUrlsRef.current[fieldName]) ? previewUrlsRef.current[fieldName] : []),
      ...items.map((item) => item.previewUrl),
    ]

    setImageFiles((prev) => ({ ...prev, [fieldName]: [...(prev[fieldName] || []), ...items] }))
    event.target.value = ''
  }

  const removeExistingImage = (fieldName, index) => {
    setForm((current) => ({
      ...current,
      [fieldName]: (Array.isArray(current[fieldName]) ? current[fieldName] : []).filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const removePendingImage = (fieldName, imageId) => {
    setImageFiles((prev) => {
      const removed = (prev[fieldName] || []).find((item) => item.id === imageId)
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl)
        previewUrlsRef.current[fieldName] = (previewUrlsRef.current[fieldName] || []).filter((url) => url !== removed.previewUrl)
      }
      return {
        ...prev,
        [fieldName]: (prev[fieldName] || []).filter((item) => item.id !== imageId),
      }
    })
  }

  const renderField = (field) => {
    const controlClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40'
    if (field.type === 'select') {
      return (
        <select name={field.name} required={field.required} value={form[field.name] ?? ''} onChange={updateForm} className={controlClass}>
          {!field.required && <option value="">Sin seleccionar</option>}
          {field.options.map((option) => (
            <option key={getOptionValue(option)} value={getOptionValue(option)}>
              {getOptionLabel(option)}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === 'relation') {
      const options = relationOptions[field.name] || []
      const value = form[field.name] ?? (field.multiple ? [] : '')
      return (
        <select multiple={field.multiple} name={field.name} required={field.required && (!field.multiple || value.length === 0)} disabled={loadingRelations} value={value} onChange={updateForm} className={`${controlClass} disabled:opacity-60`}>
          {!field.multiple && <option value="">{loadingRelations ? 'Cargando opciones...' : 'Selecciona una opcion'}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      )
    }

    if (field.type === 'checkbox') {
      return <input name={field.name} type="checkbox" checked={Boolean(form[field.name])} onChange={updateForm} className="h-5 w-5" />
    }

    if (field.type === 'image') {
      const preview = imagePreviews[field.name]
      const existingUrl = form[field.name]
      return (
        <div className="flex flex-col gap-2">
          <input
            id={`file-${field.name}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChange(field.name, e)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          {(preview || existingUrl) && (
            <img
              src={preview || existingUrl}
              alt="Preview"
              className="h-32 w-48 rounded-md border border-slate-200 object-cover dark:border-slate-700"
            />
          )}
        </div>
      )
    }

    if (field.type === 'imageList') {
      const existingImages = Array.isArray(form[field.name]) ? form[field.name] : []
      const pendingImages = imageFiles[field.name] || []

      return (
        <div className="rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
          <input
            id={`file-${field.name}`}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleImageListChange(field.name, e)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          {(existingImages.length > 0 || pendingImages.length > 0) ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {existingImages.map((image, index) => {
                const url = image?.urlImagen ?? image?.UrlImagen ?? image?.url ?? image?.Url ?? image
                return (
                  <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                    <img src={url} alt={`Imagen ${index + 1}`} className="h-32 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 px-2 py-2 text-xs text-slate-600 dark:text-slate-300">
                      <span>{index === 0 ? 'Principal' : `Imagen ${index + 1}`}</span>
                      <button type="button" onClick={() => removeExistingImage(field.name, index)} className="rounded border border-red-200 px-2 py-1 font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/70 dark:hover:bg-red-950/40">
                        Quitar
                      </button>
                    </div>
                  </div>
                )
              })}
              {pendingImages.map((item, index) => (
                <div key={item.id} className="relative overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-900/70 dark:bg-indigo-950/30">
                  <img src={item.previewUrl} alt={`Nueva imagen ${index + 1}`} className="h-32 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 px-2 py-2 text-xs text-indigo-700 dark:text-indigo-200">
                    <span>Nueva imagen</span>
                    <button type="button" onClick={() => removePendingImage(field.name, item.id)} className="rounded border border-red-200 bg-white px-2 py-1 font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/70 dark:bg-slate-950 dark:hover:bg-red-950/40">
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No hay imagenes cargadas.</p>
          )}
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          name={field.name}
          required={field.required}
          value={form[field.name] ?? ''}
          onChange={updateForm}
          rows={5}
          className={`${controlClass} min-h-32 resize-y leading-relaxed`}
        />
      )
    }

    const isComputedCapacityTotal = moduleKey === 'tipos-habitacion' && field.name === 'capacidadTotal'
    return (
      <input
        name={field.name}
        type={field.type}
        step={field.step}
        required={field.required}
        readOnly={isComputedCapacityTotal}
        value={form[field.name] ?? ''}
        onChange={updateForm}
        className={controlClass}
      />
    )
  }

  const validateBusinessRules = (enrichedForm) => {
    const correo = String(enrichedForm.correo ?? '').trim()
    const telefono = String(enrichedForm.telefono ?? '').trim()

    if (correo && !EMAIL_REGEX.test(correo)) {
      return 'El correo no tiene un formato valido.'
    }

    if (telefono && !PHONE_10_REGEX.test(telefono)) {
      return 'El telefono debe contener exactamente 10 digitos.'
    }

    if (moduleKey === 'clientes') {
      const idError = validateEcuadorIdentification(enrichedForm.tipoIdentificacion, enrichedForm.numeroIdentificacion)
      if (idError) return idError
    }

    if (enrichedForm.fechaNacimiento && !isAdult(enrichedForm.fechaNacimiento, 18)) {
      return 'El cliente debe tener al menos 18 anios.'
    }

    if (enrichedForm.edadMinimaHuesped !== undefined && enrichedForm.edadMinimaHuesped !== null && String(enrichedForm.edadMinimaHuesped).trim() !== '') {
      const edadMinima = Number(enrichedForm.edadMinimaHuesped)
      if (Number.isNaN(edadMinima) || edadMinima < 18) {
        return 'La edad minima del huesped debe ser 18 o mayor.'
      }
    }

    return ''
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      let enrichedForm = { ...form }
      const requiredError = visibleFields.find((field) => {
        if (!field.required) return false
        if (field.type === 'checkbox' || field.type === 'image' || field.type === 'imageList') return false
        const value = enrichedForm[field.name]
        if (field.multiple) return !Array.isArray(value) || value.length === 0
        return value === undefined || value === null || String(value).trim() === ''
      })

      if (requiredError) {
        const message = `El campo "${getFieldLabel(requiredError)}" es obligatorio.`
        setError(message)
        await showError('Formulario incompleto', message)
        setSaving(false)
        return
      }

      const invalidNumber = visibleFields.find((field) => {
        if (!['number'].includes(field.type)) return false
        const value = enrichedForm[field.name]
        return value !== undefined && value !== null && String(value).trim() !== '' && Number.isNaN(Number(value))
      })

      if (invalidNumber) {
        const message = `El campo "${getFieldLabel(invalidNumber)}" debe ser numerico.`
        setError(message)
        await showError('Dato invalido', message)
        setSaving(false)
        return
      }

      const businessRuleError = validateBusinessRules(enrichedForm)
      if (businessRuleError) {
        setError(businessRuleError)
        await showError('Dato invalido', businessRuleError)
        setSaving(false)
        return
      }

      const imageFields = visibleFields.filter((f) => f.type === 'image')
      for (const field of imageFields) {
        const file = imageFiles[field.name]
        const existingUrl = form[field.name]

        // Validación: Si el campo es requerido y no hay archivo nuevo ni URL existente
        if (field.required && !file && !existingUrl) {
          setError(`La imagen para el campo "${field.name}" es obligatoria.`)
          setSaving(false)
          return
        }

        if (file) {
          try {
            const url = await upload(file)
            enrichedForm[field.name] = url
          } catch (err) {
            setError(err.message)
            setSaving(false)
            return
          }
        }
      }

      const imageListFields = visibleFields.filter((f) => f.type === 'imageList')
      for (const field of imageListFields) {
        const existingImages = Array.isArray(enrichedForm[field.name]) ? enrichedForm[field.name] : []
        const pendingImages = imageFiles[field.name] || []

        if (field.required && existingImages.length === 0 && pendingImages.length === 0) {
          setError(`Debe cargar al menos una imagen para "${getFieldLabel(field)}".`)
          setSaving(false)
          return
        }

        const uploadedImages = []
        for (const item of pendingImages) {
          try {
            const url = await upload(item.file)
            uploadedImages.push({
              imagenGuid: '00000000-0000-0000-0000-000000000000',
              urlImagen: url,
              descripcion: '',
            })
          } catch (err) {
            setError(err.message)
            setSaving(false)
            return
          }
        }

        enrichedForm[field.name] = [...existingImages, ...uploadedImages].map((image, index) => ({
          ...image,
          orden: index + 1,
          esPrincipal: index === 0,
        }))
      }

      const payload = coercePayload(enrichedForm, module, isEdit ? 'update' : 'create')
      if (isEdit) await adminApi.update(module.endpoint, recordId, payload)
      else await adminApi.create(module.endpoint, payload)
      await showSuccess(
        isEdit ? 'Registro actualizado' : 'Registro creado',
        isEdit ? 'Los cambios se guardaron correctamente.' : 'El nuevo registro se creo correctamente.',
      )
      navigate(`/admin/${moduleKey}`, { replace: true })
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      await showError('No se pudo guardar', message)
    } finally {
      setSaving(false)
    }
  }

  const isBusy = saving || uploading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Formulario</p>
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
        </div>
        <Link to={`/admin/${moduleKey}`} className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
          Volver
        </Link>
      </div>

      {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {uploadError && !error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</div>}
      {uploading && <div className="rounded-md bg-indigo-50 px-4 py-3 text-sm text-indigo-700">Subiendo imagen a Cloudinary...</div>}

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 dark:bg-slate-900">Cargando registro...</div>
      ) : (
        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleFields.map((field) => (
              <label key={field.name} className={`flex flex-col gap-1.5 text-sm text-slate-700 dark:text-slate-200 ${field.layout === 'wide' ? 'md:col-span-2 xl:col-span-3' : ''}`}>
                <span className="font-medium text-slate-800 dark:text-slate-100">{getFieldLabel(field)}</span>
                {renderField(field)}
              </label>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button disabled={isBusy} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
              {uploading ? 'Subiendo imagen...' : saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
            <Link to={`/admin/${moduleKey}`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
