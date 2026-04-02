import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export const signUpSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const forgotPasswordSchema = z.object({
  email: z.email('Email inválido'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type SignInSchema = z.infer<typeof signInSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
