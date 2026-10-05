export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <img src="/connectly-icon.png" alt="Connectly" className="brand-icon" />
      <div><strong>Connectly</strong><span>Share. Connect. Inspire.</span></div>
    </div>
  );
}
