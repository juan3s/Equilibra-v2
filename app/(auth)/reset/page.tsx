'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordSchema, type ResetPasswordSchema } from '@/lib/schemas/auth.schema'

export default function ResetPage() {
  const router = useRouter()
  const [sessionReady, setSessionReady] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    // Detectar el evento PASSWORD_RECOVERY que Supabase emite cuando el usuario
    // llega desde el enlace de restablecimiento de contraseña.
    const supabase = createClient()

    // Si ya existe una sesión de recuperación activa, mostrar el formulario.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionReady(true)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function onSubmit(values: ResetPasswordSchema) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setSuccessMessage('¡Contraseña actualizada! Redirigiendo…')
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (!sessionReady) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Verificando enlace de restablecimiento…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
        <h1 className="text-xl font-semibold text-foreground mb-1">
          Restablecer contraseña
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Ingresa tu nueva contraseña para tu cuenta.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-pass">Nueva contraseña</Label>
            <Input
              id="new-pass"
              type="password"
              placeholder="Mín. 6 caracteres"
              autoComplete="new-password"
              {...form.register('password')}
              aria-invalid={!!form.formState.errors.password}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pass">Confirmar contraseña</Label>
            <Input
              id="confirm-pass"
              type="password"
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              {...form.register('confirmPassword')}
              aria-invalid={!!form.formState.errors.confirmPassword}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? 'Actualizando…'
              : 'Actualizar contraseña'}
          </Button>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          {successMessage && (
            <p className="text-sm text-accent">{successMessage}</p>
          )}
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Diseñado por Digital Workflows®
      </p>
    </div>
  )
}
