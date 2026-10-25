import { Link, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/utils/constants';

export default function NotFound() {
  const { pathname } = useLocation();
  const { session } = useAuth();
  const home = session ? ROLES[session.role].home : '/';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-6 text-center">
      <Logo />
      <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent">
        <Compass size={30} aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-semibold text-accent">Error 404</p>
      <h1 className="mt-1 text-2xl font-bold text-ink">This page could not be found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        There is no page at <code className="rounded bg-soft px-1.5 py-0.5 text-xs text-ink">{pathname}</code>. It may have moved, or the link may be incorrect.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to={home} className="btn btn-primary">{session ? 'Back to my dashboard' : 'Back to home'}</Link>
        {!session && <Link to="/login" className="btn btn-secondary">Sign in</Link>}
      </div>
    </div>
  );
}
