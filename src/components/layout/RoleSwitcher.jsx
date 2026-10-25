import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, FlaskConical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROLES, ROLE_KEYS } from '@/utils/constants';
import useClickOutside from '@/components/layout/useClickOutside';

export default function RoleSwitcher() {
  const { session, switchRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrap, close, open);

  const choose = (role) => {
    setOpen(false);
    if (role === session.role) return;
    switchRole(role);
    navigate(ROLES[role].home);
    toast.info(`Switched to ${ROLES[role].label} view`, 'Demonstration feature only. This is not authentication.');
  };

  return (
    <div className="relative" ref={wrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-lg border border-warning/40 bg-warning-50 px-3 text-xs font-semibold text-warning hover:opacity-90"
      >
        <FlaskConical size={15} aria-hidden="true" />
        <span className="hidden md:inline">Demo role:</span>
        <span className="text-ink">{ROLES[session.role].label}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-line bg-card shadow-pop">
          <p className="border-b border-line bg-warning-50 px-4 py-2.5 text-xs font-medium text-warning">
            Demonstration feature. Switching roles is not a production authentication mechanism.
          </p>
          {ROLE_KEYS.map((key) => (
            <button key={key} role="menuitemradio" aria-checked={key === session.role} type="button" onClick={() => choose(key)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-soft">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-accent">{key === session.role && <Check size={16} />}</span>
              <span>
                <span className="block text-sm font-semibold text-ink">{ROLES[key].label}</span>
                <span className="block text-xs text-muted">{ROLES[key].blurb}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
