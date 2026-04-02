'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Building2,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/pockets', label: 'Bolsillos', icon: Wallet },
  { href: '/accounts', label: 'Cuentas', icon: Building2 },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar border-r border-border shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <span className="text-xl font-bold text-primary">Equilibra</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
