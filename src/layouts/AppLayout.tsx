import { useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { token, me } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isAuthenticated = Boolean(token && me)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {isAuthenticated ? (
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <div className={isAuthenticated ? 'md:pl-[240px]' : ''}>
        <Navbar
          onOpenSidebar={
            isAuthenticated ? () => setMobileSidebarOpen(true) : undefined
          }
        />
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
