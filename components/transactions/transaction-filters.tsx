'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, X, Upload, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategories, useSubcategories } from '@/lib/hooks/use-reference-data'
import { useTransactionUIStore } from '@/lib/stores/transaction-filters.store'
import { useFiltersFromParams } from '@/lib/hooks/use-transactions'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface MultiSelectProps {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
}

function MultiSelect({ label, options, selected, onChange, disabled }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  const displayLabel = selected.length > 0 ? `${label} (${selected.length})` : label

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="gap-1"
      >
        {displayLabel}
        <ChevronDown className="h-3 w-3" />
      </Button>
      {open && (
        <div className="absolute top-full mt-1 z-50 bg-background border border-border rounded-md shadow-md p-1 min-w-48 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-1.5">Sin opciones</p>
          ) : (
            options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function TransactionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: categories = [] } = useCategories()
  const { data: allSubcategories = [] } = useSubcategories()
  const openCreateForm = useTransactionUIStore((s) => s.openCreateForm)
  const openBulkUpload = useTransactionUIStore((s) => s.openBulkUpload)
  const filters = useFiltersFromParams()

  const updateParams = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      params.delete(key)
      if (value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else {
          params.set(key, value)
        }
      }
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const prevMonth = () => {
    const m = filters.month === 0 ? 11 : filters.month - 1
    const y = filters.month === 0 ? filters.year - 1 : filters.year
    updateParams({ month: String(m), year: String(y) })
  }

  const nextMonth = () => {
    const m = filters.month === 11 ? 0 : filters.month + 1
    const y = filters.month === 11 ? filters.year + 1 : filters.year
    updateParams({ month: String(m), year: String(y) })
  }

  const handleCategoryChange = (values: string[]) => {
    const validSubcategories = filters.subcategoryIds.filter((sid) => {
      const sub = allSubcategories.find((s) => s.id === sid)
      return sub && (values.length === 0 || values.includes(sub.category_id))
    })
    updateParams({ category: values, subcategory: validSubcategories })
  }

  const handleSubcategoryChange = (values: string[]) => {
    updateParams({ subcategory: values })
  }

  const hasActiveFilters =
    filters.categoryIds.length > 0 || filters.subcategoryIds.length > 0

  const clearFilters = () => updateParams({ category: null, subcategory: null })

  const availableSubcategories =
    filters.categoryIds.length > 0
      ? allSubcategories.filter((s) => filters.categoryIds.includes(s.category_id))
      : allSubcategories

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Month/year navigation */}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-36 text-center">
          {MONTH_NAMES[filters.month]} {filters.year}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Category multi-select */}
      <MultiSelect
        label="Categorías"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        selected={filters.categoryIds}
        onChange={handleCategoryChange}
      />

      {/* Subcategory multi-select */}
      <MultiSelect
        label="Subcategorías"
        options={availableSubcategories.map((s) => ({ value: s.id, label: s.name }))}
        selected={filters.subcategoryIds}
        onChange={handleSubcategoryChange}
        disabled={availableSubcategories.length === 0}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      )}

      {/* Actions */}
      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={openBulkUpload} className="gap-1">
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>
        <Button size="sm" onClick={openCreateForm} className="gap-1">
          <Plus className="h-4 w-4" />
          Nueva transacción
        </Button>
      </div>
    </div>
  )
}
