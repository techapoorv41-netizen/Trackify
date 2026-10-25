import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { initials } from '@/utils/format';
import useClickOutside from '@/components/layout/useClickOutside';

export default function ProfileMenu() {
  const { signOut } = useAuth();
  const { user, roleMeta } = useCurrentUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrap, close, open);

  if (!user) return null;

  return (
    <div className="relative" ref={wrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex h-10 items-center gap-2 rounded-lg pl-1 pr-2 hover:bg-soft"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{initials(user.name)}</span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink">{user.name}</span>
          <span className="block text-[11px] text-muted">{roleMeta.label}</span>
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-card shadow-pop">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <p className="mt-1 text-[11px] font-medium text-accent">{roleMeta.label} · demo session</p>
          </div>
          <Link role="menuitem" to="/profile" onClick={close} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-soft">
            <User size={16} className="text-muted" /> Profile
          </Link>
          <Link role="menuitem" to="/settings" onClick={close} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-soft">
            <Settings size={16} className="text-muted" /> Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => { close(); signOut(); navigate('/'); }}
            className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-sm text-danger hover:bg-danger-50"
          >
            <LogOut size={16} /> End demo session
          </button>
        </div>
      )}
    </div>
  );
}
