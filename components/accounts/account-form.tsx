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
  accountSchema,
  ACCOUNT_TYPES,
  type AccountFormValues,
} from '@/lib/schemas/account.schema'
import { useCurrentUser } from '@/components/layout/user-provider'
import { useCurrencies } from '@/lib/hooks/use-reference-data'
import { createClient } from '@/lib/supabase/client'
import { keys } from '@/lib/queries/keys'
import { getBanks, createAccount, updateAccount } from '@/lib/queries/accounts'
import type { Tables } from '@/lib/types/database.types'

type BankAccount = Tables<'bank_accounts'> & {
  banks: { id: string; name: string; brand: string | null } | null
}

interface AccountFormProps {
  isOpen: boolean
  editingAccount: BankAccount | null
  onClose: () => void
}

export function AccountForm({ isOpen, editingAccount, onClose }: AccountFormProps) {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { data: currencies = [] } = useCurrencies()

  const { data: banks = [] } = useQuery({
    queryKey: keys.banks(),
    queryFn: () => getBanks(supabase),
    enabled: isOpen,
  })

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      description: '',
      account_type: 'ahorros',
      account_number: '',
      currency_code: 'COP',
      initial_balance: 0,
      bank_id: '',
    },
  })

  // Reset / pre-populate on open
  useEffect(() => {
    if (isOpen) {
      if (editingAccount) {
        form.reset({
          name: editingAccount.name,
          description: editingAccount.description ?? '',
          account_type: editingAccount.account_type ?? 'ahorros',
          account_number: editingAccount.account_number ?? '',
          currency_code: editingAccount.currency_code,
          initial_balance: editingAccount.initial_balance,
          bank_id: editingAccount.bank_id,
        })
      } else {
        form.reset({
          name: '',
          description: '',
          account_type: 'ahorros',
          account_number: '',
          currency_code: currencies[0]?.code ?? 'COP',
          initial_balance: 0,
          bank_id: banks[0]?.id ?? '',
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingAccount])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: keys.accounts(userId) })

  const createMutation = useMutation({
    mutationFn: (values: AccountFormValues) =>
      createAccount(supabase, userId, values),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: (values: AccountFormValues) =>
      updateAccount(supabase, editingAccount!.id, values),
    onSuccess: invalidate,
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error || updateMutation.error

  const onSubmit = async (values: AccountFormValues) => {
    try {
      if (editingAccount) {
        await updateMutation.mutateAsync(values)
      } else {
        await createMutation.mutateAsync(values)
      }
      onClose()
    } catch {
      // error shown via mutationError
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {editingAccount ? 'Editar cuenta' : 'Nueva cuenta bancaria'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej. Cuenta ahorros principal"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
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
              placeholder="Ej. Cuenta para gastos del hogar"
              {...form.register('description')}
            />
          </div>

          {/* Account type + Account number */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo de cuenta</Label>
              <Select
                value={form.watch('account_type')}
                onValueChange={(v) => form.setValue('account_type', v ?? 'ahorros')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.account_type && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.account_type.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="account_number">
                No. de cuenta{' '}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="account_number"
                type="text"
                placeholder="Ej. 1234567890"
                {...form.register('account_number')}
              />
            </div>
          </div>

          {/* Bank */}
          <div className="space-y-1">
            <Label>Banco</Label>
            <Select
              value={form.watch('bank_id')}
              onValueChange={(v) => form.setValue('bank_id', v ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un banco" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.bank_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.bank_id.message}
              </p>
            )}
          </div>

          {/* Currency + Initial balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Moneda</Label>
              <Select
                value={form.watch('currency_code')}
                onValueChange={(v) => form.setValue('currency_code', v ?? 'COP')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
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

            <div className="space-y-1">
              <Label htmlFor="initial_balance">Saldo inicial</Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                min="0"
                {...form.register('initial_balance', { valueAsNumber: true })}
              />
              {form.formState.errors.initial_balance && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.initial_balance.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit error */}
          {mutationError && (
            <p className="text-sm text-destructive">
              Error al guardar la cuenta. Intenta de nuevo.
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : editingAccount ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
