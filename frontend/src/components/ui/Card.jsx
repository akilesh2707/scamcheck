export default function Card({ children, className = '', style, as: Tag = 'div', padded = true, hoverable = false, ...rest }) {
  return (
    <Tag
      className={`sc-card ${hoverable ? 'sc-card-hoverable' : ''} ${className}`}
      style={{
        background: 'var(--sc-surface)',
        border: '1px solid var(--sc-border)',
        borderRadius: 'var(--sc-radius-md)',
        padding: padded ? '24px' : 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
