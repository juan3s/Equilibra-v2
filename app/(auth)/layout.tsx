import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceso',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      {children}
    </div>
  )
}
