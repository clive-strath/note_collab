'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut, Settings, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  // Track scroll for glassmorphism effect
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check
    setIsScrolled(window.scrollY > 10)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass backdrop-blur-md border-b border-ink-200/50 shadow-paper' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="flex items-center justify-between h-full px-4 md:px-6 relative z-10">
        <div className="flex items-center space-x-3">
          {/* Hamburger for mobile */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg btn-ghost-paper text-ink-600"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2 group">
            {/* 3D Paper Logo */}
            <div className="relative perspective-1000" style={{ perspective: '1000px' }}>
              <div className="w-8 h-8 preserve-3d transition-transform duration-300 group-hover:rotate-y-12" style={{ transformStyle: 'preserve-3d' }}>
                {/* Front face - Paper sheet */}
                <div className="absolute inset-0 rounded-lg shadow-paper" style={{ 
                  transform: 'translateZ(2px)',
                  background: 'linear-gradient(180deg, #FFFEF7 0%, #F9F5E1 100%)',
                  border: '1px solid rgba(132, 121, 108, 0.15)',
                }}>
                  {/* Ruled lines on logo */}
                  <div className="absolute inset-1" style={{
                    backgroundImage: 'repeating-linear-gradient(transparent 0, transparent 6px, rgba(173, 216, 230, 0.4) 6px, rgba(173, 216, 230, 0.4) 7px)',
                    backgroundSize: '100% 7px',
                    borderRadius: '4px',
                  }} />
                  {/* Red margin line */}
                  <div className="absolute left-2 top-0 bottom-0 w-px" style={{
                    background: 'rgba(231, 76, 60, 0.5)',
                  }} />
                  {/* Fold corner */}
                  <div className="absolute top-0 right-0 w-3 h-3" style={{
                    background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)',
                    borderRadius: '0 4px 0 0',
                  }} />
                </div>
                {/* Back face */}
                <div className="absolute inset-0 rounded-lg" style={{ 
                  transform: 'translateZ(-2px) rotateY(180deg)',
                  background: 'linear-gradient(180deg, #F2ECC3 0%, #E8DEA0 100%)',
                  border: '1px solid rgba(132, 121, 108, 0.1)',
                }} />
                {/* Thickness edges */}
                <div className="absolute inset-0 rounded-lg" style={{ 
                  transform: 'translateZ(-2px)',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
                }} />
              </div>
            </div>
            <h1 className="text-lg font-semibold text-ink-900 hidden sm:block font-caveat tracking-wide">
              Paperverse
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user && (
            <>
              <div className="hidden md:flex items-center space-x-2">
                <div className="avatar-paper">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || user.email || 'User'} />
                    <AvatarFallback className="bg-amber-100 text-amber-600 text-sm font-medium">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-sm text-ink-700 max-w-[160px] truncate font-medium">
                  {user.user_metadata?.name || user.email}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign out"
                className="btn-ghost-paper"
              >
                <LogOut className="h-4 w-4 text-ink-600" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Subtle bottom border accent when scrolled */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,149,0,0.3), transparent)',
        }} />
      )}
    </header>
  )
}
