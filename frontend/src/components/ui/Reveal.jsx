/** Staggered fade/slide-in wrapper so evidence cards feel like they're
 * "appearing" progressively rather than all popping in at once. */
export default function Reveal({ children, delay = 0, as: Tag = 'div', style, ...rest }) {
  return (
    <Tag
      className="sc-animate-in"
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
