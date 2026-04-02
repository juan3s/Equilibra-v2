import { z } from 'zod'

export const transactionSchema = z.object({
  occurred_at: z.string().min(1, 'La fecha es requerida'),
  description: z.string().optional(),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency_code: z.string().min(1, 'La moneda es requerida'),
  bank_account_id: z.string().min(1, 'La cuenta bancaria es requerida'),
  category_id: z.string().min(1, 'La categoría es requerida'),
  subcategory_id: z.string().nullable().optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>
