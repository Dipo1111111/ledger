import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-stone-900 font-semibold hover:brightness-110 active:brightness-90 shadow-md shadow-gold/30',
  secondary:
    'border border-gold/40 text-gold hover:bg-gold/10 active:bg-gold/20',
  ghost:
    'text-cream/60 hover:text-cream hover:bg-white/5 active:bg-white/10',
  danger:
    'bg-danger text-white hover:brightness-110 active:brightness-90 shadow-md shadow-danger/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2.5 sm:py-2 text-xs min-h-[44px] sm:min-h-0',
  md: 'px-6 py-3 sm:py-2.5 text-sm min-h-[44px] sm:min-h-0',
  lg: 'px-10 py-4 sm:py-3.5 text-base min-h-[48px] sm:min-h-0',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        relative inline-flex items-center justify-center gap-2 rounded-lg font-sans
        tracking-wide transition-all duration-150 select-none
        focus-visible:outline-2 focus-visible:outline-gold/60 focus-visible:outline-offset-2
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...rest}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
      <span className={loading ? 'invisible' : undefined}>{children}</span>
    </button>
  );
}
