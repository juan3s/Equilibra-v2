'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
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
import { useTransactions, useTransactionMutations } from '@/lib/hooks/use-transactions'
import { useTransactionUIStore } from '@/lib/stores/transaction-filters.store'
import type { TransactionWithRelations } from '@/lib/queries/transactions'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatAmount(
  amount: number,
  operationFactor: number | undefined,
  currencyCode: string,
) {
  const factor = operationFactor ?? 0
  const sign = factor === 1 ? '+' : factor === -1 ? '-' : ''
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${sign}${formatted} ${currencyCode}`
}

function getAmountClass(operationFactor: number | undefined) {
  const factor = operationFactor ?? 0
  if (factor === 1) return 'text-green-600'
  if (factor === -1) return 'text-red-600'
  return 'text-muted-foreground'
}

export function TransactionsTable() {
  const { data: transactions = [], isLoading } = useTransactions()
  const { deleteMutation } = useTransactionMutations()
  const openEditForm = useTransactionUIStore((s) => s.openEditForm)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (tx: TransactionWithRelations) => {
    setDeletingId(tx.id)
    try {
      await deleteMutation.mutateAsync(tx.id)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Cargando transacciones...
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        No hay transacciones para este período.
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Cuenta</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Subcategoría</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-20 sr-only">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const operationFactor = tx.categories?.category_types?.operation_factor
            return (
              <TableRow key={tx.id}>
                <TableCell className="text-sm tabular-nums whitespace-nowrap">
                  {formatDate(tx.occurred_at)}
                </TableCell>
                <TableCell className="text-sm max-w-52 truncate">
                  {tx.description ?? (
                    <span className="text-muted-foreground italic">Sin descripción</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{tx.bank_accounts?.name ?? '—'}</TableCell>
                <TableCell>
                  {tx.categories ? (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {tx.categories.name}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {tx.subcategories?.name ?? '—'}
                </TableCell>
                <TableCell
                  className={`text-right text-sm font-medium tabular-nums whitespace-nowrap ${getAmountClass(operationFactor)}`}
                >
                  {formatAmount(tx.amount, operationFactor, tx.currency_code)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditForm(tx)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(tx)}
                      disabled={deletingId === tx.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
