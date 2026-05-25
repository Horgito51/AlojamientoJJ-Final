import { useMemo, useState } from 'react'

const getDefaultSearchText = (row) => {
  try {
    return JSON.stringify(row ?? {}).toLowerCase()
  } catch {
    return ''
  }
}

const getSortValue = (row, column) => {
  const value = row?.[column] ?? row?.[column?.charAt(0).toUpperCase() + column?.slice(1)] ?? ''
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  return String(value ?? '').toLowerCase()
}

export default function AdminDataTable({ columns, rows, getColumnLabel, getRowId, renderValue, renderActions, getSearchText = getDefaultSearchText }) {
  const [search, setSearch] = useState('')
  const [pageLength, setPageLength] = useState(10)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ column: '', direction: 'asc' })

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    const baseRows = term ? rows.filter((row) => getSearchText(row).includes(term)) : rows
    if (!sort.column) return baseRows

    return [...baseRows].sort((a, b) => {
      const first = getSortValue(a, sort.column)
      const second = getSortValue(b, sort.column)
      if (first < second) return sort.direction === 'asc' ? -1 : 1
      if (first > second) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [getSearchText, rows, search, sort])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageLength))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageLength
  const visibleRows = filteredRows.slice(startIndex, startIndex + pageLength)
  const firstRecord = filteredRows.length === 0 ? 0 : startIndex + 1
  const lastRecord = Math.min(startIndex + pageLength, filteredRows.length)

  const updateSearch = (event) => {
    setSearch(event.target.value)
    setPage(1)
  }

  const updatePageLength = (event) => {
    setPageLength(Number(event.target.value))
    setPage(1)
  }

  const toggleSort = (column) => {
    setPage(1)
    setSort((current) => {
      if (current.column !== column) return { column, direction: 'asc' }
      return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div className="admin-datatable overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="admin-table-toolbar">
        <label className="admin-table-length">
          <span>Mostrar</span>
          <select value={pageLength} onChange={updatePageLength}>
            {[5, 10, 25, 50].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <span>registros</span>
        </label>

        <label className="admin-table-search">
          <svg className="admin-table-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input value={search} onChange={updateSearch} placeholder="Buscar registros..." aria-label="Buscar registros" />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className="px-6 py-3 font-semibold">
                  <button type="button" onClick={() => toggleSort(column)} className="inline-flex items-center gap-1.5 text-left">
                    {getColumnLabel(column)}
                    <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m8 15 4 4 4-4m0-6-4-4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={getRowId(row) || `${safePage}-${index}`}>
                {columns.map((column, columnIndex) => (
                  <td key={column} className={columnIndex === 0 ? 'px-6 py-4 font-semibold text-slate-900 whitespace-nowrap dark:text-white' : 'px-6 py-4'}>
                    {renderValue(row, column)}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  {renderActions(row)}
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-slate-500">
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dt-layout-row flex flex-col justify-between gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center">
        <div className="dt-info text-sm">
          Mostrando {firstRecord} a {lastRecord} de {filteredRows.length} registros
        </div>
        <div className="dt-paging flex flex-wrap justify-end gap-2">
          <button type="button" className="dt-paging-button" disabled={safePage <= 1} onClick={() => setPage(1)}>Primera</button>
          <button type="button" className="dt-paging-button" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Anterior</button>
          <span className="dt-paging-button current">Pagina {safePage} de {totalPages}</span>
          <button type="button" className="dt-paging-button" disabled={safePage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Siguiente</button>
          <button type="button" className="dt-paging-button" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>Ultima</button>
        </div>
      </div>
    </div>
  )
}
