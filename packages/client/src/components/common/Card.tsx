import type { ReactNode, HTMLAttributes } from 'react';

type CardVariant = 'default' | 'gold';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
  /** If true, removes padding */
  noPadding?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-felt-light/80 backdrop-blur-sm border border-cream/[0.08] shadow-card',
  gold:
    'bg-felt-light/80 backdrop-blur-sm border-2 card-gold',
};

export function Card({
  variant = 'default',
  noPadding = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${noPadding ? '' : 'p-7'}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}
