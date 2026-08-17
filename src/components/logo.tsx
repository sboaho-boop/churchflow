import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-base' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={sizes[size].icon}
        height={sizes[size].icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Church building */}
        <rect x="35" y="45" width="30" height="40" rx="2" fill="#2563EB" />
        <rect x="42" y="60" width="8" height="12" rx="1" fill="white" />
        <rect x="54" y="60" width="8" height="12" rx="1" fill="white" />
        
        {/* Roof */}
        <path d="M30 47L50 25L70 47" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Cross on top */}
        <rect x="48" y="28" width="4" height="12" fill="#2563EB" />
        <rect x="44" y="32" width="12" height="4" fill="#2563EB" />
        
        {/* Flow/wave element */}
        <path
          d="M15 75C20 70 30 70 35 75C40 80 50 80 55 75C60 70 70 70 75 75C80 80 90 80 95 75"
          stroke="url(#flowGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span className={cn('font-bold tracking-tight', sizes[size].text)}>
          <span className="text-blue-600">Church</span>
          <span className="text-purple-600">Flow</span>
        </span>
      )}
    </div>
  )
}
