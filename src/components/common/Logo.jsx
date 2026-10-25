import { Link } from 'react-router-dom';

export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#163B65" />
      <path d="M9 17l5 5 9-12" fill="none" stroke="#3B82F6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ to = '/', light = false, showText = true, size = 32 }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 rounded-lg" aria-label="Trackify home">
      <LogoMark size={size} />
      {showText && <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Trackify</span>}
    </Link>
  );
}
