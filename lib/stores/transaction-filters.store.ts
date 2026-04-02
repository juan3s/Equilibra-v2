import { create } from 'zustand'
import type { TransactionWithRelations } from '@/lib/queries/transactions'

interface TransactionUIStore {
  isFormOpen: boolean
  editingTransaction: TransactionWithRelations | null
  isBulkUploadOpen: boolean
  openCreateForm: () => void
  openEditForm: (transaction: TransactionWithRelations) => void
  closeForm: () => void
  openBulkUpload: () => void
  closeBulkUpload: () => void
}

export const useTransactionUIStore = create<TransactionUIStore>((set) => ({
  isFormOpen: false,
  editingTransaction: null,
  isBulkUploadOpen: false,
  openCreateForm: () => set({ isFormOpen: true, editingTransaction: null }),
  openEditForm: (transaction) => set({ isFormOpen: true, editingTransaction: transaction }),
  closeForm: () => set({ isFormOpen: false, editingTransaction: null }),
  openBulkUpload: () => set({ isBulkUploadOpen: true }),
  closeBulkUpload: () => set({ isBulkUploadOpen: false }),
}))
