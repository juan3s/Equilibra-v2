import { z } from 'zod'

export const ACCOUNT_TYPES = ['ahorros', 'corriente', 'inversión', 'otro'] as const

export const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  account_type: z.string().min(1, 'El tipo de cuenta es requerido'),
  account_number: z.string().optional(),
  currency_code: z.string().min(1, 'La moneda es requerida'),
  initial_balance: z.number().min(0, 'El saldo inicial no puede ser negativo'),
  bank_id: z.string().min(1, 'El banco es requerido'),
})

export type AccountFormValues = z.infer<typeof accountSchema>
