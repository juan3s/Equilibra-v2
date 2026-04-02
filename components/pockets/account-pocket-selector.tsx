'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccounts } from '@/lib/hooks/use-reference-data'
import { usePocketsUIStore } from '@/lib/stores/pockets-ui.store'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface AccountPocketSelectorProps {
  month: number
  year: number
  onMonthChange: (month: number, year: number) => void
}

export function AccountPocketSelector({
  month,
  year,
  onMonthChange,
}: AccountPocketSelectorProps) {
  const { data: accounts = [] } = useAccounts()
  const { selectedAccountId, setSelectedAccount } = usePocketsUIStore()

  function changeMonth(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y-- }
    else if (m > 11) { m = 0; y++ }
    onMonthChange(m, y)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Account filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Cuenta:</span>
        <Select
          value={selectedAccountId ?? ''}
          onValueChange={(v) => setSelectedAccount(v || null)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todas las cuentas" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAccountId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedAccount(null)}
            className="text-xs text-muted-foreground"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Period navigation */}
      <div className="flex items-center gap-1 ml-auto">
        <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium px-3 min-w-36 text-center">
          {MONTHS[month]} {year}
        </span>
        <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
