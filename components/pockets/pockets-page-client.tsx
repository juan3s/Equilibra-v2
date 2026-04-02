'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { usePocketsUIStore } from '@/lib/stores/pockets-ui.store'
import { PocketsList } from '@/components/pockets/pockets-list'
import { PocketMovementForm } from '@/components/pockets/pocket-movement-form'

export function PocketsPageClient() {
  const { openCreateForm } = usePocketsUIStore()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Bolsillos</h1>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo movimiento
        </Button>
      </div>
      <PocketsList />
      <PocketMovementForm />
    </div>
  )
}
