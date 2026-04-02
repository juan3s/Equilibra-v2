'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { profileSchema, type ProfileFormValues } from '@/lib/schemas/profile.schema'
import { useCurrentUser } from '@/components/layout/user-provider'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/queries/profile'
import type { Tables } from '@/lib/types/database.types'

type Profile = Tables<'profiles'>

const GENDER_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otros', label: 'Otros' },
] as const

interface ProfileFormProps {
  profile: Profile | null
  email: string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const { userId } = useCurrentUser()
  const supabase = createClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      gender: profile?.gender ?? null,
      birth_date: profile?.birth_date ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateProfile(supabase, userId, values),
    onSuccess: () => {
      setSuccessMessage('Perfil actualizado correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
    },
  })

  const onSubmit = async (values: ProfileFormValues) => {
    setSuccessMessage(null)
    try {
      await updateMutation.mutateAsync(values)
    } catch {
      // error shown via updateMutation.error
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Actualiza tu información personal
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 max-w-lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Email — readonly, comes from auth */}
          <div className="space-y-1">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              El correo no se puede cambiar desde aquí.
            </p>
          </div>

          {/* First name + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                type="text"
                placeholder="Juan"
                {...form.register('first_name')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Pérez"
                {...form.register('last_name')}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <Label>Género</Label>
            <Select
              value={form.watch('gender') ?? ''}
              onValueChange={(v) =>
                form.setValue(
                  'gender',
                  v ? (v as 'Masculino' | 'Femenino' | 'Otros') : null,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Birth date */}
          <div className="space-y-1">
            <Label htmlFor="birth_date">Fecha de nacimiento</Label>
            <Input id="birth_date" type="date" {...form.register('birth_date')} />
          </div>

          {/* Success message */}
          {successMessage && (
            <p className="text-sm text-accent">{successMessage}</p>
          )}

          {/* Error message */}
          {updateMutation.error && (
            <p className="text-sm text-destructive">
              Error al actualizar el perfil. Intenta de nuevo.
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
