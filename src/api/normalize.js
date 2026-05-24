export const unwrapData = (response) => response?.data ?? response

export const normalizeList = (response) => {
  const data = unwrapData(response)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.$values)) return data.$values
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.Items)) return data.Items
  if (Array.isArray(data?.items?.$values)) return data.items.$values
  if (Array.isArray(data?.Items?.$values)) return data.Items.$values
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.Data)) return data.Data
  if (Array.isArray(data?.data?.$values)) return data.data.$values
  if (Array.isArray(data?.Data?.$values)) return data.Data.$values
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.Results)) return data.Results
  if (Array.isArray(data?.results?.$values)) return data.results.$values
  if (Array.isArray(data?.Results?.$values)) return data.Results.$values
  if (Array.isArray(data?.result)) return data.result
  if (Array.isArray(data?.Result)) return data.Result
  if (Array.isArray(data?.result?.$values)) return data.result.$values
  if (Array.isArray(data?.Result?.$values)) return data.Result.$values
  if (data && typeof data === 'object') {
    console.warn('Respuesta de lista no reconocida:', data)
  }
  return []
}

export const normalizeEntity = (response) => {
  const data = unwrapData(response)
  return data?.data ?? data?.Data ?? data?.result ?? data?.Result ?? data
}

export const getId = (entity, candidates = []) => {
  for (const key of candidates) {
    if (entity?.[key] !== undefined && entity?.[key] !== null) return entity[key]
  }
  return entity?.id ?? entity?.Id ?? null
}
