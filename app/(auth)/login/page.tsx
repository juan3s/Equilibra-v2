'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  type SignInSchema,
  type SignUpSchema,
  type ForgotPasswordSchema,
} from '@/lib/schemas/auth.schema'

type Mode = 'signin' | 'signup' | 'forgot'

// ── Inner component (reads searchParams) ────────────────────────────────────
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>('signin')
  const [serverError, setServerError] = useState<string | null>(
    searchParams.get('error') === 'auth_callback_failed'
      ? 'El enlace ha caducado o es inválido. Solicita uno nuevo.'
      : null
  )
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // ── Sign In ────────────────────────────────────────────────────────────────
  const signInForm = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  })

  async function onSignIn(values: SignInSchema) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      setServerError(
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : error.message
      )
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const signUpForm = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  })

  async function onSignUp(values: SignUpSchema) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setSuccessMessage('Revisa tu bandeja de entrada para confirmar tu cuenta.')
  }

  // ── Forgot Password ────────────────────────────────────────────────────────
  const forgotForm = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onForgotPassword(values: ForgotPasswordSchema) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset`,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setSuccessMessage(
      'Te enviamos un enlace de restablecimiento. Revisa tu email.'
    )
  }

  function switchMode(next: Mode) {
    setMode(next)
    setServerError(null)
    setSuccessMessage(null)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === 'signin' && 'Iniciar sesión'}
            {mode === 'signup' && 'Crear cuenta'}
            {mode === 'forgot' && 'Restablecer contraseña'}
          </h1>
          <span className="text-xs text-muted-foreground">Equilibra • Auth</span>
        </div>

        {/* ── Sign In ────────────────────────────────────────────────────── */}
        {mode === 'signin' && (
          <form
            onSubmit={signInForm.handleSubmit(onSignIn)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="si-email">Email</Label>
              <Input
                id="si-email"
                type="email"
                placeholder="alguien@example.com"
                autoComplete="email"
                {...signInForm.register('email')}
                aria-invalid={!!signInForm.formState.errors.email}
              />
              {signInForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signInForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="si-password">Contraseña</Label>
              <Input
                id="si-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...signInForm.register('password')}
                aria-invalid={!!signInForm.formState.errors.password}
              />
              {signInForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signInForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={signInForm.formState.isSubmitting}
            >
              {signInForm.formState.isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Regístrate
                </button>
              </p>
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="hover:text-foreground transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        )}

        {/* ── Sign Up ───────────────────────────────────────────────────── */}
        {mode === 'signup' && (
          <form
            onSubmit={signUpForm.handleSubmit(onSignUp)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="su-email">Email</Label>
              <Input
                id="su-email"
                type="email"
                placeholder="persona@dominio.com"
                autoComplete="email"
                {...signUpForm.register('email')}
                aria-invalid={!!signUpForm.formState.errors.email}
              />
              {signUpForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="su-password">Contraseña</Label>
              <Input
                id="su-password"
                type="password"
                placeholder="Mín. 6 caracteres"
                autoComplete="new-password"
                {...signUpForm.register('password')}
                aria-invalid={!!signUpForm.formState.errors.password}
              />
              {signUpForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              size="lg"
              disabled={signUpForm.formState.isSubmitting}
            >
              {signUpForm.formState.isSubmitting
                ? 'Creando cuenta…'
                : 'Crear cuenta'}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        )}

        {/* ── Forgot Password ───────────────────────────────────────────── */}
        {mode === 'forgot' && (
          <form
            onSubmit={forgotForm.handleSubmit(onForgotPassword)}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="re-email">Email</Label>
              <Input
                id="re-email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                {...forgotForm.register('email')}
                aria-invalid={!!forgotForm.formState.errors.email}
              />
              {forgotForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {forgotForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={forgotForm.formState.isSubmitting}
            >
              {forgotForm.formState.isSubmitting
                ? 'Enviando…'
                : 'Enviar enlace de restablecimiento'}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-primary hover:underline font-medium"
              >
                Volver a iniciar sesión
              </button>
            </p>
          </form>
        )}

        {/* ── Feedback ──────────────────────────────────────────────────── */}
        {serverError && (
          <p className="mt-4 text-sm text-destructive">{serverError}</p>
        )}
        {successMessage && (
          <p className="mt-4 text-sm text-accent">{successMessage}</p>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Diseñado por Digital Workflows®
      </p>
    </div>
  )
}

// ── Page export (wraps LoginForm in Suspense for useSearchParams) ────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">Cargando…</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
