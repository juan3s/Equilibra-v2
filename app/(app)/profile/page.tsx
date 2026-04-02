import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { getUserProfile } from '@/lib/dal'
import { ProfileForm } from '@/components/profile/profile-form'

export const metadata: Metadata = {
  title: 'Perfil',
}

export default async function ProfilePage() {
  const { user } = await verifySession()
  const profile = await getUserProfile()

  return (
    <ProfileForm
      profile={profile}
      email={user.email ?? ''}
    />
  )
}
