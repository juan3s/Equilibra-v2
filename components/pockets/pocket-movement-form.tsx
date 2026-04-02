'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
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
import {
  pocketMovementSchema,
  type PocketMovementFormValues,
} from '@/lib/schemas/pocket.schema'
import { usePocketsUIStore } from '@/lib/stores/pockets-ui.store'
import { useAccounts } from '@/lib/hooks/use-reference-data'
import { createClient } from '@/lib/supabase/client'
import { keys } from '@/lib/queries/keys'
import {
  getPocketsForAccount,
  upsertAllocation,
} from '@/lib/queries/pockets'
import { useCurrentUser } from '@/components/layout/user-provider'

const MOVEMENT_TYPES = [
  { value: 'load', label: 'Carga (entrada al bolsillo)' },
  { value: 'unload', label: 'Descarga (salida del bolsillo)' },
  { value: 'internal', label: 'Interno (entre bolsillos)' },
]

function toDateInput(iso: string) {
  return iso.split('T')[0]
}

export function PocketMovementForm() {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { isFormOpen, editingAllocation, closeForm } = usePocketsUIStore()
  const { data: accounts = [] } = useAccounts()

  const form = useForm<PocketMovementFormValues>({
    resolver: zodResolver(pocketMovementSchema),
    defaultValues: {
      movement_type: 'load',
      occurred_at: new Date().toISOString().split('T')[0],
      description: '',
      bank_account_id: '',
      from_pocket_id: null,
      to_pocket_id: null,
      amount: 0,
    },
  })

  const selectedAccountId = form.watch('bank_account_id')
  const movementType = form.watch('movement_type')

  // Load pockets for the selected account
  const { data: pockets = [] } = useQuery({
    queryKey: keys.pockets(selectedAccountId),
    queryFn: () => getPocketsForAccount(supabase, selectedAccountId),
    enabled: !!selectedAccountId,
  })

  // Reset form on open/close and pre-populate when editing
  useEffect(() => {
    if (isFormOpen) {
      if (editingAllocation) {
        const type =
          !editingAllocation.from_pocket_id && editingAllocation.to_pocket_id
            ? 'load'
            : editingAllocation.from_pocket_id && !editingAllocation.to_pocket_id
              ? 'unload'
              : 'internal'

        form.reset({
          movement_type: type as 'load' | 'unload' | 'internal',
          occurred_at: toDateInput(editingAllocation.occurred_at),
          description: editingAllocation.description ?? '',
          bank_account_id: editingAllocation.bank_account_id,
          from_pocket_id: editingAllocation.from_pocket_id ?? null,
          to_pocket_id: editingAllocation.to_pocket_id ?? null,
          amount: editingAllocation.amount,
        })
      } else {
        form.reset({
          movement_type: 'load',
          occurred_at: new Date().toISOString().split('T')[0],
          description: '',
          bank_account_id: accounts[0]?.id ?? '',
          from_pocket_id: null,
          to_pocket_id: null,
          amount: 0,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormOpen, editingAllocation])

  // Clear pocket selections when account changes
  const handleAccountChange = (value: string | null) => {
    form.setValue('bank_account_id', value ?? '')
    form.setValue('from_pocket_id', null)
    form.setValue('to_pocket_id', null)
  }

  // Clear irrelevant pocket fields when type changes
  const handleTypeChange = (value: string | null) => {
    const type = (value ?? 'load') as 'load' | 'unload' | 'internal'
    form.setValue('movement_type', type)
    if (type === 'load') form.setValue('from_pocket_id', null)
    if (type === 'unload') form.setValue('to_pocket_id', null)
  }

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['allocations', userId] })

  const upsertMutation = useMutation({
    mutationFn: ({ values, id }: { values: PocketMovementFormValues; id?: string }) =>
      upsertAllocation(supabase, userId, values, id),
    onSuccess: invalidate,
  })

  const onSubmit = async (values: PocketMovementFormValues) => {
    try {
      await upsertMutation.mutateAsync({
        values,
        id: editingAllocation?.id,
      })
      closeForm()
    } catch {
      // error shown via mutation state
    }
  }

  const showFrom = movementType === 'unload' || movementType === 'internal'
  const showTo = movementType === 'load' || movementType === 'internal'

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {editingAllocation ? 'Editar movimiento' : 'Nuevo movimiento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Movement type */}
          <div className="space-y-1">
            <Label>Tipo de movimiento</Label>
            <Select
              value={form.watch('movement_type')}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              placeholder="Ej. Ahorro mensual"
              {...form.register('description')}
            />
          </div>

          {/* Account */}
          <div className="space-y-1">
            <Label>Cuenta bancaria</Label>
            <Select
              value={form.watch('bank_account_id')}
              onValueChange={handleAccountChange}
            >
              <SelectTrigger className="w-full">
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

          {/* From pocket — visible for unload and internal */}
          {showFrom && (
            <div className="space-y-1">
              <Label>Bolsillo origen</Label>
              <Select
                value={form.watch('from_pocket_id') ?? undefined}
                onValueChange={(v) =>
                  form.setValue('from_pocket_id', v || null)
                }
                disabled={!selectedAccountId || pockets.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona bolsillo origen" />
                </SelectTrigger>
                <SelectContent>
                  {pockets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.from_pocket_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.from_pocket_id.message}
                </p>
              )}
            </div>
          )}

          {/* To pocket — visible for load and internal */}
          {showTo && (
            <div className="space-y-1">
              <Label>Bolsillo destino</Label>
              <Select
                value={form.watch('to_pocket_id') ?? undefined}
                onValueChange={(v) =>
                  form.setValue('to_pocket_id', v || null)
                }
                disabled={!selectedAccountId || pockets.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona bolsillo destino" />
                </SelectTrigger>
                <SelectContent>
                  {pockets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.to_pocket_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.to_pocket_id.message}
                </p>
              )}
            </div>
          )}

          {/* Amount */}
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

          {/* Submit error */}
          {upsertMutation.error && (
            <p className="text-sm text-destructive">
              Error al guardar el movimiento. Intenta de nuevo.
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              disabled={upsertMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending
                ? 'Guardando...'
                : editingAllocation
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
