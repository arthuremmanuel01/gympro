'use client';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  glass?: boolean;
}

export function Card({ children, className, interactive = false, onClick, glass = false }: CardProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          glass ? 'glass' : 'card-base',
          'card-interactive w-full text-left cursor-pointer',
          interactive && 'card-interactive',
          className
        )}
      >
        {children}
      </button>
    );
  }
  return (
    <div
      className={cn(
        glass ? 'glass' : 'card-base',
        interactive && 'card-interactive',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5 pt-5 pb-0', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-t border-[var(--color-border-subtle)] flex items-center gap-2',
        className
      )}
    >
      {children}
    </div>
  );
}
