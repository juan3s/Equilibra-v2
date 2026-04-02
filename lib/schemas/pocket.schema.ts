import { z } from 'zod'

export const pocketMovementSchema = z
  .object({
    movement_type: z.enum(['load', 'unload', 'internal']),
    occurred_at: z.string().min(1, 'La fecha es requerida'),
    description: z.string().optional(),
    bank_account_id: z.string().min(1, 'La cuenta bancaria es requerida'),
    from_pocket_id: z.string().nullable().optional(),
    to_pocket_id: z.string().nullable().optional(),
    amount: z.number().positive('El monto debe ser mayor a 0'),
  })
  .superRefine((data, ctx) => {
    if (data.movement_type === 'load' && !data.to_pocket_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El bolsillo destino es requerido para cargas',
        path: ['to_pocket_id'],
      })
    }
    if (data.movement_type === 'unload' && !data.from_pocket_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El bolsillo origen es requerido para descargas',
        path: ['from_pocket_id'],
      })
    }
    if (data.movement_type === 'internal') {
      if (!data.from_pocket_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El bolsillo origen es requerido',
          path: ['from_pocket_id'],
        })
      }
      if (!data.to_pocket_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El bolsillo destino es requerido',
          path: ['to_pocket_id'],
        })
      }
    }
  })

export type PocketMovementFormValues = z.infer<typeof pocketMovementSchema>
