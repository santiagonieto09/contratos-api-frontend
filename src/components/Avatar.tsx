import { cn } from '@/lib/utils'

interface AvatarProps {
  email: string
  size?: 'sm' | 'md' | 'lg'
}

function getInitials(email: string): string {
  return email.charAt(0).toUpperCase()
}

const sizeMap = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-10 w-10 text-base',
}

export function Avatar({ email, size = 'md' }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md bg-primary-container font-medium text-on-primary-container',
        sizeMap[size]
      )}
      title={email}
      aria-label={email}
    >
      {getInitials(email)}
    </div>
  )
}
