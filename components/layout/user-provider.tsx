'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

interface UserContextValue {
  userId: string
  user: User
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({
  userId,
  user,
  children,
}: {
  userId: string
  user: User
  children: ReactNode
}) {
  return (
    <UserContext.Provider value={{ userId, user }}>
      {children}
    </UserContext.Provider>
  )
}

export function useCurrentUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useCurrentUser must be used within UserProvider')
  return ctx
}
