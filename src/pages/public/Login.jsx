import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, EyeOff, FlaskConical, Gauge, Loader2, Scale, ShieldCheck } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { loginSchema } from '@/utils/schemas';
import { ROLES, ROLE_KEYS, DEMO_USER_IDS } from '@/utils/constants';
import { mockUsers } from '@/data/mockUsers';
import { load, remove, save } from '@/services/storageService';

const ROLE_ICONS = { institute: Building2, officer: Scale, admin: Gauge };
const emailFor = (role) => mockUsers.find((u) => u.id === DEMO_USER_IDS[role]).email;

export default function Login() {
  const { signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('institute');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const remembered = load('remember', null);
  const {
    register, handleSubmit, setValue, formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: remembered || emailFor('institute'), password: '', remember: Boolean(remembered) },
  });

  useEffect(() => {
    if (!remembered) setValue('email', emailFor(role));
  }, [role, remembered, setValue]);

  const finish = (chosen) => {
    const s = signIn(chosen);
    toast.success(`Signed in to the ${ROLES[chosen].label} demo`, 'Demo authentication is simulated. No credentials were sent anywhere.');
    navigate(ROLES[s.role].home, { replace: true });
  };

  const onSubmit = (values) => {
    setLoading(true);
    if (values.remember) save('remember', values.email);
    else remove('remember');
    setTimeout(() => finish(role), 700);
  };

  const quick = (chosen) => {
    setRole(chosen);
    setLoading(true);
    setTimeout(() => finish(chosen), 350);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-sidebar p-12 text-white lg:flex">
        <Logo light />
        <div>
          <h1 className="text-3xl font-bold leading-tight">Approvals, compliance and deadlines in one workspace.</h1>
          <ul className="mt-8 space-y-4 text-white/75">
            {['Guided application wizard with document checks', 'Officer scrutiny workspace with audit trail', 'Configurable rules, workflows and alerts'].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/50">Prototype demonstration. Not an official AICTE system.</p>
      </aside>

      <main className="flex items-center justify-center bg-page px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-2xl font-bold text-ink">Sign in to Trackify</h2>
          <p className="mt-1 text-sm text-muted">Choose a demo role, then sign in or jump straight in.</p>

          <div className="mt-5 flex gap-3 rounded-lg border border-warning/30 bg-warning-50 p-3.5">
            <FlaskConical size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-ink">
              <strong>Demo authentication is simulated.</strong> Any non-empty password works and nothing is sent to a server. Please do not enter a real password.
            </p>
          </div>

          <fieldset className="mt-6">
            <legend className="label">Demo role</legend>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_KEYS.map((key) => {
                const Icon = ROLE_ICONS[key];
                const active = role === key;
                return (
                  <label key={key} className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-center text-xs font-semibold transition-colors focus-within:ring-2 focus-within:ring-accent/50 ${active ? 'border-accent bg-accent-50 text-accent' : 'border-line bg-card text-muted hover:bg-soft'}`}>
                    <input type="radio" name="role" value={key} checked={active} onChange={() => setRole(key)} className="sr-only" />
                    <Icon size={18} aria-hidden="true" />
                    {ROLES[key].label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="username" aria-invalid={Boolean(errors.email)} className={`input ${errors.email ? 'input-error' : ''}`} {...register('email')} />
              {errors.email && <p role="alert" className="field-error">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="off" placeholder="Any value works in demo mode" aria-invalid={Boolean(errors.password)} className={`input pr-10 ${errors.password ? 'input-error' : ''}`} {...register('password')} />
                <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted hover:bg-soft hover:text-ink">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p role="alert" className="field-error">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input type="checkbox" className="h-4 w-4 rounded border-line text-accent" {...register('remember')} />
                Remember my email
              </label>
              <Link to="/forgot-password" state={{ from: location.pathname }} className="text-sm font-semibold text-accent hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
              {loading ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Signing in…</> : 'Sign in (demo)'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> or enter without credentials <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {ROLE_KEYS.map((key) => (
              <button key={key} type="button" disabled={loading} onClick={() => quick(key)} className="btn btn-secondary btn-sm py-2">
                {ROLES[key].label}
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted"><Link to="/" className="font-semibold text-accent hover:underline">Back to home</Link></p>
        </div>
      </main>
    </div>
  );
}
