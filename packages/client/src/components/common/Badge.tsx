import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  /** Optional dot indicator color */
  dot?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-cream/10 text-text-secondary border-cream/15',
  gold: 'bg-gold/15 text-gold border-gold/25',
  success: 'bg-success/15 text-success border-success/25',
  warning: 'bg-warning/15 text-warning border-warning/25',
  danger: 'bg-danger/15 text-danger border-danger/25',
  info: 'bg-spade/15 text-spade border-spade/25',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
  dot,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1
        rounded-full text-[0.7rem] font-semibold uppercase tracking-wider
        border transition-colors
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </span>
  );
}
