'use client'

import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { keys } from '@/lib/queries/keys'
import {
  getAllocations,
  deleteAllocation,
  type AllocationFilters,
} from '@/lib/queries/pockets'
import { AccountPocketSelector } from '@/components/pockets/account-pocket-selector'
import { usePocketsUIStore } from '@/lib/stores/pockets-ui.store'
import { useCurrentUser } from '@/components/layout/user-provider'

const MOVEMENT_LABELS: Record<string, { label: string; colorClass: string }> = {
  load: { label: 'Carga', colorClass: 'text-emerald-600' },
  unload: { label: 'Descarga', colorClass: 'text-rose-600' },
  internal: { label: 'Interno', colorClass: 'text-blue-600' },
}

function getMovementType(fromId: string | null, toId: string | null) {
  if (!fromId && toId) return 'load'
  if (fromId && !toId) return 'unload'
  return 'internal'
}

export function PocketsList() {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { selectedAccountId, openEditForm } = usePocketsUIStore()

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  const filters: AllocationFilters = { month, year, accountId: selectedAccountId }

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: keys.allocations(userId, filters),
    queryFn: () => getAllocations(supabase, userId, filters),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['allocations', userId] })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAllocation(supabase, id),
    onSuccess: invalidate,
  })

  function handleMonthChange(m: number, y: number) {
    setMonth(m)
    setYear(y)
  }

  return (
    <div className="space-y-4">
      <AccountPocketSelector
        month={month}
        year={year}
        onMonthChange={handleMonthChange}
      />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Cargando movimientos…
                </TableCell>
              </TableRow>
            ) : allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No hay movimientos en este período
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((row) => {
                const type = getMovementType(row.from_pocket_id, row.to_pocket_id)
                const { label, colorClass } = MOVEMENT_LABELS[type]
                const account = row.bank_accounts as { name: string; currency_code: string } | null
                const currency = account?.currency_code ?? 'COP'
                const amountStr = new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency,
                }).format(row.amount)
                const dateStr = new Date(row.occurred_at).toLocaleDateString('es-CO', {
                  timeZone: 'UTC',
                })
                const fromPocket = row.from_pocket as { name: string } | null
                const toPocket = row.to_pocket as { name: string } | null

                return (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    <TableCell className="whitespace-nowrap">{dateStr}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.description || '—'}
                    </TableCell>
                    <TableCell>{account?.name ?? '—'}</TableCell>
                    <TableCell>{fromPocket?.name ?? '—'}</TableCell>
                    <TableCell>{toPocket?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={colorClass}
                      >
                        {label}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium whitespace-nowrap ${colorClass}`}>
                      {amountStr}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(row)}
                        className="text-primary hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(row.id)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
