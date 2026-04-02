'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { useCurrentUser } from '@/components/layout/user-provider'

function getInitials(email: string): string {
  return email.substring(0, 2).toUpperCase()
}

export function TopNav() {
  const { user } = useCurrentUser()
  const email = user.email ?? ''

  return (
    <header className="flex items-center justify-end gap-4 h-14 px-6 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-3">
        {/* Avatar with initials */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold select-none">
          {getInitials(email)}
        </div>

        {/* Email — hidden on small screens */}
        <span className="text-sm text-muted-foreground hidden sm:block">
          {email}
        </span>

        {/* Sign-out via Server Action */}
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="icon" title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
