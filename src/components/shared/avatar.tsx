import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = {
    xs: 'h-7 w-7 text-xs',
    sm: 'h-9 w-9 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  };

  if (src) {
    return (
      
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold flex-shrink-0',
        'bg-[var(--color-primary-muted)] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20',
        sizes[size],
        className
      )}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
