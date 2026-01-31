import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />
      <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 px-4 py-6">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
