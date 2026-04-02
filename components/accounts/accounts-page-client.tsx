'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AccountForm } from '@/components/accounts/account-form'
import { useAccounts } from '@/lib/hooks/use-reference-data'
import { useCurrentUser } from '@/components/layout/user-provider'
import { createClient } from '@/lib/supabase/client'
import { keys } from '@/lib/queries/keys'
import { deleteAccount } from '@/lib/queries/accounts'
import type { Tables } from '@/lib/types/database.types'

type BankAccount = Tables<'bank_accounts'> & {
  banks: { id: string; name: string; brand: string | null } | null
}

export function AccountsPageClient() {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { data: accounts = [], isLoading } = useAccounts()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)

  const openCreate = () => {
    setEditingAccount(null)
    setIsFormOpen(true)
  }

  const openEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setIsFormOpen(true)
  }

  const handleClose = () => {
    setIsFormOpen(false)
    setEditingAccount(null)
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAccount(supabase, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.accounts(userId) }),
  })

  const handleDelete = (account: BankAccount) => {
    if (!confirm(`¿Eliminar la cuenta "${account.name}"? Esta acción no se puede deshacer.`)) return
    deleteMutation.mutate(account.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cuentas bancarias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra tus cuentas bancarias y sus detalles
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva cuenta
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Saldo inicial</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Cargando cuentas...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No tienes cuentas bancarias aún. Crea tu primera cuenta.
                </TableCell>
              </TableRow>
            )}
            {accounts.map((account) => {
              const acc = account as BankAccount
              return (
                <TableRow key={acc.id}>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell className="capitalize">
                    {acc.account_type ?? '—'}
                  </TableCell>
                  <TableCell>{acc.currency_code}</TableCell>
                  <TableCell>{acc.banks?.name ?? '—'}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('es-CO', {
                      style: 'decimal',
                      minimumFractionDigits: 0,
                    }).format(acc.initial_balance)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(acc)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(acc)}
                        disabled={deleteMutation.isPending}
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

      <AccountForm
        isOpen={isFormOpen}
        editingAccount={editingAccount}
        onClose={handleClose}
      />
    </div>
  )
}
