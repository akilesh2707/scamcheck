// A small hand-picked icon set (feather-style strokes) so the app doesn't
// need an icon library dependency. Add paths here as needed.
const PATHS = {
  shield:
    'M12 2 4 5v6c0 5.25 3.6 9.9 8 11 4.4-1.1 8-5.75 8-11V5l-8-3Z',
  'shield-check': 'M12 2 4 5v6c0 5.25 3.6 9.9 8 11 4.4-1.1 8-5.75 8-11V5l-8-3Z|M9 12.5l2 2 4-4.5',
  'arrow-right': 'M5 12h14|M13 6l6 6-6 6',
  'arrow-up-right': 'M7 17 17 7|M8 7h9v9',
  'check-circle': 'M22 11.5V12a10 10 0 1 1-6-9.2|M22 4 12 14.5l-3-3',
  check: 'M20 6 9 17l-5-5',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  sparkles:
    'M9.5 2 11 6.5 15.5 8 11 9.5 9.5 14 8 9.5 3.5 8 8 6.5 9.5 2Z|M18 14l.9 2.6L21.5 17.5 18.9 18.4 18 21l-.9-2.6L14.5 17.5l2.6-.9L18 14Z',
  'help-circle':
    'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M9.1 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4|M12 17.5h.01',
  'x-circle': 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M15 9l-6 6|M9 9l6 6',
  'minus-circle': 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M8 12h8',
  'alert-triangle':
    'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L12.7 3.9a2 2 0 0 0-3.4 0Z|M12 9v4|M12 17.2h.01',
  link: 'M9.5 14.5 14.5 9.5|M7 17 4.8 19.2a3.4 3.4 0 0 1-4.8-4.8L2.2 12|M17 7l2.2-2.2a3.4 3.4 0 0 1 4.8 4.8L21.8 12',
  globe: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M2 12h20|M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z',
  'credit-card': 'M2 6h20v12H2z|M2 10h20',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M12 7v5l3.5 2',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  menu: 'M3 6h18|M3 12h18|M3 18h18',
  x: 'M18 6 6 18|M6 6l12 12',
  history: 'M3 12a9 9 0 1 0 3-6.7|M3 4v4h4|M12 7v5l3 3',
  'log-in': 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4|M10 17l5-5-5-5|M15 12H3',
  user: 'M20 21a8 8 0 1 0-16 0|M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z|M23 21v-2a4 4 0 0 0-3-3.9|M16 3.1a4 4 0 0 1 0 7.8',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z|M14 2v6h6|M9 13h6|M9 17h6|M9 9h1',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M17 8l-5-5-5 5|M12 3v12',
  target: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z|M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  scale: 'M12 3v18|M7 8H2l3.5 7a3 3 0 0 0 5 0Z|M22 8h-5l3.5 7a3 3 0 0 0 5 0Z|M5 21h14',
  'refresh-cw': 'M23 4v6h-6|M1 20v-6h6|M3.5 9a9 9 0 0 1 14.85-3.36L23 10|M1 14l4.65 4.36A9 9 0 0 0 20.5 15',
  ban: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M4.9 4.9l14.2 14.2',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M7 10l5 5 5-5|M12 15V3',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z|M21 21l-4.35-4.35',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z|M22 6l-10 7L2 6',
  lock: 'M5 11h14v10H5z|M8 11V7a4 4 0 0 1 8 0v4',
  info: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M12 16v-5|M12 8h.01',
  compass: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z|M16 8l-2.5 6.5L8 17l2.5-6.5L16 8Z',
  layers: 'M12 2 2 7l10 5 10-5-10-5Z|M2 17l10 5 10-5|M2 12l10 5 10-5',
  'trending-up': 'M23 6l-9.5 9.5-5-5L1 18|M17 6h6v6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4|M16 17l5-5-5-5|M21 12H9',
};

export default function Icon({ name, size = 18, strokeWidth = 2, className = '', ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  const paths = d.split('|');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
}
