import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        variant === 'outline' && 'ring-1 ring-inset',
        variant === 'ghost' && 'bg-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
