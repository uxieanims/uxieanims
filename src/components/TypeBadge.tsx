import { cn } from '@/lib/utils';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TypeBadge({ type, size = 'md', className }: TypeBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'type-badge font-semibold uppercase tracking-wider',
        `type-${type}`,
        sizeClasses[size],
        className
      )}
    >
      {type}
    </span>
  );
}
