import { useInView } from '../../hooks/useInView';

export default function ScrollReveal({ children, delay = 0, style, as: Tag = 'div', ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
