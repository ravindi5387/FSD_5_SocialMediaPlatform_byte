export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  return src ? <img className={`avatar avatar-${size}`} src={src} alt={name} /> : <div className={`avatar avatar-fallback avatar-${size}`}>{initials}</div>;
}
