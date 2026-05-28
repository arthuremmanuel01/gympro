'use client';
import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  carregando?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      carregando = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]';

    const variants = {
      primary: 'btn-primary px-5 text-white',
      ghost: 'btn-ghost px-4',
      outline:
        'border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] px-4 hover:bg-white/5 transition-colors',
      danger:
        'bg-red-500/15 text-red-400 rounded-[var(--radius-md)] px-4 hover:bg-red-500/25 transition-colors ring-1 ring-red-500/30',
    };

    const sizes = {
      sm: 'h-9 text-sm px-3 rounded-[var(--radius-sm)]',
      md: 'h-11 text-sm rounded-[var(--radius-md)]',
      lg: 'h-12 text-base rounded-[var(--radius-md)]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || carregando}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {carregando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!carregando && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
