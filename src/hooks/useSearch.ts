import { useState, useMemo } from 'react'

export function useSearch<T>(items: T[], keyFn: (item: T) => string) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => items.filter((item) => keyFn(item).toLowerCase().includes(query.toLowerCase())),
    [items, query, keyFn]
  )

  return { query, setQuery, filtered }
}