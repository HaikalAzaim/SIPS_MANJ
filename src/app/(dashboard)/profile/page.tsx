import { getProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Saya</h1>
          <p className="page-subtitle">Kelola informasi akun dan keamanan Anda</p>
        </div>
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}
