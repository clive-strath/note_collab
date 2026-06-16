/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paperverse palette
        paper: {
          50: '#FFFEF7',
          100: '#FDFBF0',
          200: '#F9F5E1',
          300: '#F2ECC3',
          400: '#E8DEA0',
          500: '#DDD07A',
          600: '#C9B85E',
          700: '#A89748',
          800: '#8A7A3D',
          900: '#716335',
          950: '#3D361A',
        },
        ink: {
          50: '#F8F7F5',
          100: '#EDEAE6',
          200: '#DCD8D1',
          300: '#C4BEB3',
          400: '#A39A8C',
          500: '#877D6B',
          600: '#716858',
          700: '#5E5547',
          800: '#4E473D',
          900: '#413B33',
          950: '#231F1A',
        },
        amber: {
          50: '#FFF8ED',
          100: '#FFF0D6',
          200: '#FFE0AC',
          300: '#FFC973',
          400: '#FFAC33',
          500: '#FF9500',
          600: '#E87A00',
          700: '#BF5E0A',
          800: '#964A12',
          900: '#773D12',
          950: '#3F1C06',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E4ECE4',
          200: '#C9DBC9',
          300: '#A3C4A3',
          400: '#7AA67A',
          500: '#5A8D5A',
          600: '#457145',
          700: '#3A5A3A',
          800: '#324832',
          900: '#2D3D2D',
          950: '#141E14',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        caveat: ['var(--font-caveat)', 'cursive'],
        'permanent-marker': ['var(--font-permanent-marker)', 'cursive'],
        'dancing-script': ['var(--font-dancing-script)', 'cursive'],
        'indie-flower': ['var(--font-indie-flower)', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'float-slow': 'float 8s ease-in-out infinite 1s',
        'drift': 'drift 20s linear infinite',
        'drift-reverse': 'drift 20s linear infinite reverse',
        'fold': 'fold 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'unfold': 'unfold 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'breathe': 'breathe 4s ease-in-out infinite',
        'paper-plane': 'paper-plane 2s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-in',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
        'scale-in': 'scale-in 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-8px) rotate(1deg)' },
          '50%': { transform: 'translateY(0) rotate(0deg)' },
          '75%': { transform: 'translateY(4px) rotate(-1deg)' },
        },
        drift: {
          '0%': { transform: 'translateX(-100%) translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateX(25%) translateY(-20px) rotate(5deg)' },
          '50%': { transform: 'translateX(50%) translateY(10px) rotate(-3deg)' },
          '75%': { transform: 'translateX(75%) translateY(-15px) rotate(2deg)' },
          '100%': { transform: 'translateX(100%) translateY(0) rotate(0deg)' },
        },
        fold: {
          '0%': { transform: 'rotateX(0deg)', opacity: '1' },
          '100%': { transform: 'rotateX(-90deg)', opacity: '0' },
        },
        unfold: {
          '0%': { transform: 'rotateX(90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)', opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'paper-plane': {
          '0%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translate(100px, -100px) rotate(45deg)', opacity: '0.8' },
          '100%': { transform: 'translate(200px, -200px) rotate(90deg)', opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      transformStyle: {
        '3d': 'preserve-3d',
        'flat': 'flat',
      },
      backfaceVisibility: {
        'hidden': 'hidden',
        'visible': 'visible',
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04), 0 10px 20px rgba(0,0,0,0.03)',
        'paper-hover': '0 2px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.05)',
        'paper-floating': '0 10px 30px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.05)',
        'ink': '0 0 0 1px rgba(65,59,51,0.08), 0 2px 4px rgba(65,59,51,0.06)',
        'amber-glow': '0 0 20px rgba(255,149,0,0.3), 0 0 40px rgba(255,149,0,0.1)',
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        'ruled-paper': "linear-gradient(90deg, transparent 79px, rgba(231, 76, 60, 0.15) 79px, rgba(231, 76, 60, 0.15) 81px, transparent 81px), linear-gradient(transparent 23px, rgba(173, 216, 230, 0.3) 23px, rgba(173, 216, 230, 0.3) 24px)",
        'ruled-paper-dark': "linear-gradient(90deg, transparent 79px, rgba(231, 76, 60, 0.25) 79px, rgba(231, 76, 60, 0.25) 81px, transparent 81px), linear-gradient(transparent 23px, rgba(100, 150, 180, 0.2) 23px, rgba(100, 150, 180, 0.2) 24px)",
        'fold-line': "linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.05) 49%, rgba(0,0,0,0.05) 51%, transparent 51%)",
      },
      backgroundSize: {
        'ruled': '100% 24px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.perspective-2000': {
          perspective: '2000px',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.backface-visible': {
          backfaceVisibility: 'visible',
        },
        '.transform-3d': {
          transform: 'translateZ(0)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}