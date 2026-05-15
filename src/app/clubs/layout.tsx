'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { useMenuItems } from '@/hooks/use-permissions'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { logout as authLogout } from '@/lib/auth'

interface ClubsLayoutProps {
  children: React.ReactNode
}

function ClubsLayoutWrapper({ children }: ClubsLayoutProps) {
  const { user, isAdmin } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()
  const menuItems = useMenuItems(pathname)

  const handleLogout = async () => {
    await authLogout()
    router.replace('/login')
  }

  const theme = isAdmin() ? 'admin' : 'candidate'

  return (
    <DashboardLayout
      user={user}
      logout={handleLogout}
      menuItems={menuItems}
      title="社团管理"
      theme={theme}
    >
      {children}
    </DashboardLayout>
  )
}

export default function ClubsLayout({ children }: ClubsLayoutProps) {
  return (
    <AuthGuard requireAuth>
      <ClubsLayoutWrapper>
        {children}
      </ClubsLayoutWrapper>
    </AuthGuard>
  )
}
