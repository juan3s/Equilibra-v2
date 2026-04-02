import { create } from 'zustand'
import type { AllocationWithRelations } from '@/lib/queries/pockets'

interface PocketsUIStore {
  selectedAccountId: string | null
  isFormOpen: boolean
  editingAllocation: AllocationWithRelations | null
  setSelectedAccount: (accountId: string | null) => void
  openCreateForm: () => void
  openEditForm: (allocation: AllocationWithRelations) => void
  closeForm: () => void
}

export const usePocketsUIStore = create<PocketsUIStore>((set) => ({
  selectedAccountId: null,
  isFormOpen: false,
  editingAllocation: null,
  setSelectedAccount: (accountId) => set({ selectedAccountId: accountId }),
  openCreateForm: () => set({ isFormOpen: true, editingAllocation: null }),
  openEditForm: (allocation) => set({ isFormOpen: true, editingAllocation: allocation }),
  closeForm: () => set({ isFormOpen: false, editingAllocation: null }),
}))
