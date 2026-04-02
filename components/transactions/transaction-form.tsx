'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { transactionSchema, type TransactionFormValues } from '@/lib/schemas/transaction.schema'
import { useTransactionUIStore } from '@/lib/stores/transaction-filters.store'
import { useTransactionMutations } from '@/lib/hooks/use-transactions'
import {
  useAccounts,
  useCategories,
  useSubcategories,
  useCurrencies,
} from '@/lib/hooks/use-reference-data'

function toDateInput(iso: string) {
  return iso.split('T')[0]
}

export function TransactionForm() {
  const { isFormOpen, editingTransaction, closeForm } = useTransactionUIStore()
  const { createMutation, updateMutation } = useTransactionMutations()
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: allSubcategories = [] } = useSubcategories()
  const { data: currencies = [] } = useCurrencies()

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      occurred_at: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      currency_code: '',
      bank_account_id: '',
      category_id: '',
      subcategory_id: null,
    },
  })

  const selectedCategoryId = form.watch('category_id')
  const availableSubcategories = allSubcategories.filter(
    (s) => s.category_id === selectedCategoryId,
  )

  // Reset form on open/close and populate when editing
  useEffect(() => {
    if (isFormOpen) {
      if (editingTransaction) {
        form.reset({
          occurred_at: toDateInput(editingTransaction.occurred_at),
          description: editingTransaction.description ?? '',
          amount: editingTransaction.amount,
          currency_code: editingTransaction.currency_code,
          bank_account_id: editingTransaction.bank_account_id ?? '',
          category_id: editingTransaction.category_id,
          subcategory_id: editingTransaction.subcategory_id,
        })
      } else {
        form.reset({
          occurred_at: new Date().toISOString().split('T')[0],
          description: '',
          amount: 0,
          currency_code: currencies[0]?.code ?? '',
          bank_account_id: accounts[0]?.id ?? '',
          category_id: '',
          subcategory_id: null,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormOpen, editingTransaction])

  // Clear subcategory when category changes
  const handleCategoryChange = (value: string | null) => {
    form.setValue('category_id', value ?? '')
    form.setValue('subcategory_id', null)
  }

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({ id: editingTransaction.id, values })
      } else {
        await createMutation.mutateAsync(values)
      }
      closeForm()
    } catch {
      // Error shown via mutation state if needed
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error ?? updateMutation.error

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? 'Editar transacción' : 'Nueva transacción'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="occurred_at">Fecha</Label>
            <Input id="occurred_at" type="date" {...form.register('occurred_at')} />
            {form.formState.errors.occurred_at && (
              <p className="text-xs text-destructive">
                {form.formState.errors.occurred_at.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">
              Descripción{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Ej. Supermercado Walmart"
              {...form.register('description')}
            />
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...form.register('amount', { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Moneda</Label>
              <Select
                value={form.watch('currency_code')}
                onValueChange={(v) => form.setValue('currency_code', v ?? '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.currency_code && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.currency_code.message}
                </p>
              )}
            </div>
          </div>

          {/* Account */}
          <div className="space-y-1">
            <Label>Cuenta bancaria</Label>
            <Select
              value={form.watch('bank_account_id')}
              onValueChange={(v) => form.setValue('bank_account_id', v ?? '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.bank_account_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.bank_account_id.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Categoría</Label>
            <Select
              value={form.watch('category_id')}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.category_id.message}
              </p>
            )}
          </div>

          {/* Subcategory */}
          <div className="space-y-1">
            <Label>
              Subcategoría{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Select
              value={form.watch('subcategory_id') ?? undefined}
              onValueChange={(v) => form.setValue('subcategory_id', v ?? null)}
              disabled={!selectedCategoryId || availableSubcategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona subcategoría" />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit error */}
          {error && (
            <p className="text-sm text-destructive">
              Error al guardar la transacción. Intenta de nuevo.
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : editingTransaction
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
