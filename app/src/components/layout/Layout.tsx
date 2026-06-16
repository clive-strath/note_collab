'use client'

import { ReactNode, useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { PaperverseBackground } from './PaperverseBackground'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen relative">
      {/* Paperverse 3D Background */}
      <PaperverseBackground density="subtle" />
      
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex pt-16 relative z-10">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-4 md:p-6 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}