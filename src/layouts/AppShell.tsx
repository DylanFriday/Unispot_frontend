import type { ReactNode } from 'react'
import AppLayout from './AppLayout'

const AppShell = ({ children }: { children: ReactNode }) => {
  return <AppLayout>{children}</AppLayout>
}

export default AppShell
