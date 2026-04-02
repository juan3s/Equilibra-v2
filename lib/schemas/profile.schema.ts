import { z } from 'zod'

export const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  gender: z.enum(['Masculino', 'Femenino', 'Otros']).nullable().optional(),
  birth_date: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
