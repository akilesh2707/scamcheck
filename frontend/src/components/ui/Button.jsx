import { forwardRef } from 'react';
import Icon from './Icon';

const VARIANTS = {
  primary: {
    background: 'var(--sc-primary)',
    color: '#fff',
    border: '1px solid var(--sc-primary)',
  },
  dark: {
    background: 'var(--sc-text)',
    color: '#fff',
    border: '1px solid var(--sc-text)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--sc-text)',
    border: '1px solid var(--sc-border-strong)',
  },
  subtle: {
    background: 'var(--sc-surface-sunken)',
    color: 'var(--sc-text)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--sc-danger)',
    color: '#fff',
    border: '1px solid var(--sc-danger)',
  },
  link: {
    background: 'transparent',
    color: 'var(--sc-primary)',
    border: '1px solid transparent',
    padding: '0',
  },
};

const SIZES = {
  sm: { padding: '8px 14px', fontSize: '13px' },
  md: { padding: '12px 20px', fontSize: '14px' },
  lg: { padding: '15px 28px', fontSize: '15px' },
};

const Button = forwardRef(function Button(
  {
    as: Tag = 'button',
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'right',
    loading = false,
    fullWidth = false,
    className = '',
    style,
    children,
    disabled,
    ...rest
  },
  ref
) {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyle = variant === 'link' ? {} : SIZES[size] || SIZES.md;

  return (
    <Tag
      ref={ref}
      className={`sc-btn sc-btn-${variant} ${className}`}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 700,
        fontFamily: 'inherit',
        borderRadius: variant === 'link' ? 0 : 'var(--sc-radius-sm)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: `all var(--sc-fast) var(--sc-ease)`,
        width: fullWidth ? '100%' : undefined,
        whiteSpace: 'nowrap',
        ...variantStyle,
        ...sizeStyle,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          style={{
            width: 15,
            height: 15,
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            animation: 'sc-spin 0.7s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        icon && iconPosition === 'left' && <Icon name={icon} size={16} />
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <Icon name={icon} size={16} />}
    </Tag>
  );
});

export default Button;
