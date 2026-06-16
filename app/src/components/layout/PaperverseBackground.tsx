'use client'

import { useEffect, useRef, useState } from 'react'

interface FloatingElement {
  id: number
  type: 'sheet' | 'notebook' | 'sticky' | 'plane'
  x: number
  y: number
  z: number
  rotationX: number
  rotationY: number
  rotationZ: number
  scale: number
  opacity: number
  speed: number
  delay: number
  color: string
  size: 'sm' | 'md' | 'lg'
}

const ELEMENT_COLORS = [
  '#FFFEF7', '#FDFBF0', '#F9F5E1', '#F2ECC3', '#FFF9C4', '#FFEB3B',
  '#BBDEFB', '#64B5F6', '#C8E6C9', '#81C784', '#F8BBD0', '#F06292',
  '#FFE0B2', '#FFB74D', '#E8DEA0', '#DDD07A'
]

const STICKY_COLORS = [
  'linear-gradient(135deg, #FFF9C4 0%, #FFEB3B 100%)',
  'linear-gradient(135deg, #BBDEFB 0%, #64B5F6 100%)',
  'linear-gradient(135deg, #C8E6C9 0%, #81C784 100%)',
  'linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)',
  'linear-gradient(135deg, #FFE0B2 0%, #FFB74D 100%)',
]

function generateElements(count: number): FloatingElement[] {
  return Array.from({ length: count }, (_, i) => {
    const types: FloatingElement['type'][] = ['sheet', 'notebook', 'sticky', 'plane']
    const sizes: FloatingElement['size'][] = ['sm', 'md', 'lg']
    const type = types[Math.floor(Math.random() * types.length)]
    const size = sizes[Math.floor(Math.random() * sizes.length)]
    
    let baseScale = 1
    if (size === 'sm') baseScale = 0.6
    if (size === 'lg') baseScale = 1.4
    
    return {
      id: i,
      type,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100 - 50,
      rotationX: (Math.random() - 0.5) * 30,
      rotationY: (Math.random() - 0.5) * 30,
      rotationZ: (Math.random() - 0.5) * 360,
      scale: baseScale * (0.8 + Math.random() * 0.4),
      opacity: 0.15 + Math.random() * 0.25,
      speed: 0.15 + Math.random() * 0.25,
      delay: Math.random() * 5,
      color: type === 'sticky' 
        ? STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)]
        : ELEMENT_COLORS[Math.floor(Math.random() * ELEMENT_COLORS.length)],
      size,
    }
  })
}

export function PaperverseBackground({ 
  density = 'subtle',
  className = '',
  showOnMobile = false 
}: { 
  density?: 'subtle' | 'immersive'
  className?: string
  showOnMobile?: boolean
}) {
  const [elements, setElements] = useState<FloatingElement[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [isMounted, setIsMounted] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  const elementCount = density === 'immersive' ? 15 : 7

  useEffect(() => {
    setIsMounted(true)
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.media === 'reduce' || mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    // Generate initial elements
    setElements(generateElements(elementCount))
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [elementCount])

  useEffect(() => {
    if (!isMounted || prefersReducedMotion) return

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      setElements(prev => prev.map(el => {
        const time = (currentTime / 1000) * el.speed + el.delay
        
        // Floating motion
        const floatY = Math.sin(time * 0.5) * 8
        const floatX = Math.cos(time * 0.3) * 6
        const driftX = (Math.sin(time * 0.15) * 15)
        
        // Mouse parallax (subtle)
        const parallaxX = (mousePosition.x - 50) * 0.08 * (el.scale * 0.5)
        const parallaxY = (mousePosition.y - 50) * 0.08 * (el.scale * 0.5)
        
        // Rotation animation
        const rotX = el.rotationX + Math.sin(time * 0.4) * 5
        const rotY = el.rotationY + Math.cos(time * 0.35) * 5
        const rotZ = el.rotationZ + Math.sin(time * 0.2) * 3
        
        // Breathing scale
        const breathe = 1 + Math.sin(time * 0.6) * 0.02

        return {
          ...el,
          x: Math.max(0, Math.min(100, el.x + driftX * deltaTime * 0.5 + parallaxX * 0.01)),
          y: Math.max(0, Math.min(100, el.y + floatY * deltaTime * 0.3 + parallaxY * 0.01)),
          rotationX: rotX,
          rotationY: rotY,
          rotationZ: rotZ,
          scale: el.scale * breathe,
        }
      }))

      animationRef.current = requestAnimationFrame(animate)
    }

    lastTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isMounted, prefersReducedMotion, mousePosition])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!isMounted || prefersReducedMotion) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ perspective: '1000px' }}
    >
      <div className="absolute inset-0 preserve-3d" style={{ transformStyle: 'preserve-3d' }}>
        {elements.map((el) => (
          <FloatingPaperElement
            key={el.id}
            element={el}
            density={density}
          />
        ))}
      </div>
      
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-amber-300/20 animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl bg-sage-300/20 animate-breathe" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  )
}

interface FloatingPaperElementProps {
  element: FloatingElement
  density: 'subtle' | 'immersive'
}

function FloatingPaperElement({ element, density }: FloatingPaperElementProps) {
  const { type, x, y, z, rotationX, rotationY, rotationZ, scale, opacity, color, size } = element
  
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-32 h-40',
  }

  const notebookSizeClasses = {
    sm: 'w-20 h-24',
    md: 'w-28 h-36',
    lg: 'w-36 h-48',
  }

  const stickySizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }

  const getDimensions = () => {
    if (type === 'notebook') return notebookSizeClasses[size]
    if (type === 'sticky') return stickySizeClasses[size]
    return sizeClasses[size]
  }

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) translateZ(${z}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg) scale(${scale})`,
    transformStyle: 'preserve-3d',
    opacity,
    willChange: 'transform, opacity',
    pointerEvents: 'none',
  }

  if (type === 'plane') {
    return (
      <PaperPlane
        style={baseStyle}
        color={color}
        size={size}
      />
    )
  }

  if (type === 'notebook') {
    return (
      <Notebook
        style={baseStyle}
        color={color}
        size={size}
      />
    )
  }

  if (type === 'sticky') {
    return (
      <StickyNote
        style={baseStyle}
        background={color}
        size={size}
      />
    )
  }

  return (
    <PaperSheet
      style={baseStyle}
      color={color}
      size={size}
    />
  )
}

function PaperSheet({ style, color, size }: { style: React.CSSProperties; color: string; size: FloatingElement['size'] }) {
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-32 h-40',
  }

  return (
    <div style={style} className={`${sizeClasses[size]} preserve-3d`} aria-hidden="true">
      {/* Paper sheet with 3D thickness */}
      <div className="relative w-full h-full preserve-3d">
        {/* Front face */}
        <div className="absolute inset-0 preserve-3d" style={{ 
          transform: 'translateZ(2px)',
          backgroundColor: color,
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
        }}>
          {/* Ruled lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(transparent 0, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px)',
            backgroundSize: '100% 21px',
            borderRadius: '4px',
          }} />
          {/* Red margin line */}
          <div className="absolute left-4 top-0 bottom-0 w-px" style={{
            background: 'rgba(231, 76, 60, 0.3)',
          }} />
        </div>
        {/* Back face */}
        <div className="absolute inset-0 preserve-3d" style={{ 
          transform: 'translateZ(-2px) rotateY(180deg)',
          backgroundColor: color,
          borderRadius: '4px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
        }} />
        {/* Thickness edges */}
        <div className="absolute inset-0 preserve-3d" style={{ 
          transform: 'translateZ(-2px)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
          borderRadius: '4px',
        }}>
          <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'rgba(0,0,0,0.03)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: 'rgba(0,0,0,0.03)' }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'rgba(0,0,0,0.03)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'rgba(0,0,0,0.03)' }} />
        </div>
      </div>
      
      {/* Subtle fold line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{
        background: 'rgba(0,0,0,0.04)',
        transform: 'translateX(-50%) translateZ(3px)',
      }} />
    </div>
  )
}

function Notebook({ style, color, size }: { style: React.CSSProperties; color: string; size: FloatingElement['size'] }) {
  const sizeClasses = {
    sm: 'w-20 h-24',
    md: 'w-28 h-36',
    lg: 'w-36 h-48',
  }

  return (
    <div style={style} className={`${sizeClasses[size]} preserve-3d`} aria-hidden="true">
      <div className="relative w-full h-full preserve-3d">
        {/* Cover */}
        <div className="absolute inset-0 preserve-3d" style={{ 
          transform: 'translateZ(3px)',
          background: `linear-gradient(180deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          {/* Binding */}
          <div className="absolute left-0 top-0 bottom-0 w-4" style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 100%)',
            borderRadius: '6px 0 0 6px',
            transform: 'translateZ(4px)',
          }}>
            {/* Stitches */}
            <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2" style={{
              background: 'repeating-linear-gradient(rgba(0,0,0,0.2) 0, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 6px)',
            }} />
          </div>
          {/* Cover lines */}
          <div className="absolute inset-4" style={{
            backgroundImage: 'repeating-linear-gradient(transparent 0, transparent 18px, rgba(0,0,0,0.04) 18px, rgba(0,0,0,0.04) 19px)',
            backgroundSize: '100% 19px',
          }} />
        </div>
        {/* Pages */}
        <div className="absolute inset-1 preserve-3d" style={{ 
          transform: 'translateZ(-1px)',
          background: '#FFFEF7',
          borderRadius: '4px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
        }} />
        <div className="absolute inset-1.5 preserve-3d" style={{ 
          transform: 'translateZ(-2px)',
          background: '#FFFEF7',
          borderRadius: '3px',
        }} />
        <div className="absolute inset-2 preserve-3d" style={{ 
          transform: 'translateZ(-3px)',
          background: '#FDFBF0',
          borderRadius: '2px',
        }} />
        {/* Back cover */}
        <div className="absolute inset-0 preserve-3d" style={{ 
          transform: 'translateZ(-5px) rotateY(180deg)',
          background: `linear-gradient(180deg, ${adjustColor(color, -20)} 0%, ${color} 100%)`,
          borderRadius: '6px',
        }} />
      </div>
    </div>
  )
}

function StickyNote({ style, background, size }: { style: React.CSSProperties; background: string; size: FloatingElement['size'] }) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }

  return (
    <div style={style} className={`${sizeClasses[size]} preserve-3d`} aria-hidden="true">
      <div className="relative w-full h-full preserve-3d">
        {/* Sticky note front */}
        <div className="absolute inset-0 preserve-3d" style={{ 
          transform: 'translateZ(1.5px)',
          background,
          borderRadius: '2px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          {/* Sticky adhesive top */}
          <div className="absolute top-0 left-0 right-0 h-2" style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 100%)',
            borderRadius: '2px 2px 0 0',
          }} />
          {/* Lines */}
          <div className="absolute inset-2" style={{
            backgroundImage: 'repeating-linear-gradient(transparent 0, transparent 16px, rgba(0,0,0,0.06) 16px, rgba(0,0,0,0.06) 17px)',
            backgroundSize: '100% 17px',
          }} />
        </div>
        {/* Thickness */}
        <div className="absolute inset-0 preserve-3d" style={{ 
          transform: 'translateZ(-1.5px)',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '2px',
        }} />
        {/* Back */}
        <div className="absolute inset-0 preserve-3d" style={{ 
          transform: 'translateZ(-2px) rotateY(180deg)',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '2px',
        }} />
        {/* Paper clip on some */}
        {size === 'lg' && (
          <div className="absolute -top-2 -right-2 preserve-3d" style={{ transform: 'translateZ(4px) rotate(-15deg)' }}>
            <PaperClip color="#877D6B" size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}

function PaperPlane({ style, color, size }: { style: React.CSSProperties; color: string; size: FloatingElement['size'] }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  }

  return (
    <div 
      style={style} 
      className={`${sizeClasses[size]} preserve-3d animate-[paper-plane_20s_linear_infinite]`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="w-full h-full" style={{ transform: 'translateZ(0)' }}>
        <path
          d="M2.1 21l1.8-6.4 7.1-2.8 2.9 7.1-6.4 1.8z"
          fill={color}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="0.5"
        />
        <path
          d="M2.1 21l7.1-2.8L21.9 4.7"
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  )
}

function PaperClip({ color = '#877D6B', size = 'md' }: { color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeStyles = {
    sm: { width: 16, height: 20, strokeWidth: 1.5 },
    md: { width: 24, height: 30, strokeWidth: 2 },
    lg: { width: 32, height: 40, strokeWidth: 2.5 },
  }
  const s = sizeStyles[size]

  return (
    <svg viewBox="0 0 24 30" width={s.width} height={s.height} style={{ transform: 'translateZ(0)' }}>
      <path
        d="M5 4c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4H5v20h8c2.2 0 4-1.8 4-4s-1.8-4-4-4h-4V4z"
        fill="none"
        stroke={color}
        strokeWidth={s.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function adjustColor(color: string, amount: number): string {
  // Simple color adjustment for gradients
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export default PaperverseBackground