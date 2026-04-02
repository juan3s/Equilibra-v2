'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories, useSubcategories } from '@/lib/hooks/use-reference-data'

interface CategorySubcategorySelectProps {
  categoryId: string | undefined
  subcategoryId: string | undefined
  onCategoryChange: (categoryId: string | null) => void
  onSubcategoryChange: (subcategoryId: string | null) => void
  disabled?: boolean
}

export function CategorySubcategorySelect({
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
  disabled = false,
}: CategorySubcategorySelectProps) {
  const { data: categories = [] } = useCategories()
  const { data: allSubcategories = [] } = useSubcategories()

  const subcategories = allSubcategories.filter(
    (s) => s.category_id === categoryId
  )

  const handleCategoryChange = (value: string | null) => {
    onCategoryChange(value)
    onSubcategoryChange(null) // reset when category changes
  }

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={categoryId}
        onValueChange={handleCategoryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona categoría" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={subcategoryId}
        onValueChange={onSubcategoryChange}
        disabled={disabled || !categoryId}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona subcategoría" />
        </SelectTrigger>
        <SelectContent>
          {subcategories.length === 0 ? (
            <SelectItem value="_empty" disabled>
              Sin subcategorías
            </SelectItem>
          ) : (
            subcategories.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
