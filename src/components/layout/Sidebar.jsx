import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, FlaskConical, X } from 'lucide-react';
import Logo, { LogoMark } from '@/components/common/Logo';
import { NAV, SETTINGS_ITEM } from '@/routes/navConfig';
import { useScopedData } from '@/hooks/useScopedData';
import { ROLES } from '@/utils/constants';

function SidebarContent({ collapsed, onNavigate, onToggle, isMobile }) {
  const { role, scoped } = useScopedData();
  const { pathname } = useLocation();
  const unread = scoped.notifications.filter((n) => !n.isRead).length;
  const groups = NAV[role] || [];

  const renderItem = (item) => {
    const Icon = item.icon;
    const active = item.match ? item.match(pathname) : pathname === item.to || pathname.startsWith(`${item.to}/`);
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        aria-current={active ? 'page' : undefined}
        className={`nav-link ${active ? 'nav-link-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
      >
        <span className="relative">
          <Icon size={18} aria-hidden="true" />
          {item.badge && unread > 0 && collapsed && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-danger" />}
        </span>
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        {!collapsed && item.badge && unread > 0 && (
          <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{unread}</span>
        )}
      </NavLink>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 shrink-0 items-center border-b border-white/10 ${collapsed ? 'justify-center' : 'justify-between px-5'}`}>
        {collapsed ? <LogoMark size={30} /> : <Logo to={ROLES[role].home} light />}
        {isMobile && (
          <button type="button" onClick={onNavigate} aria-label="Close navigation" className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      <nav aria-label="Primary" className="scroll-thin flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.section}>
            {!collapsed && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{group.section}</p>}
            <div className="space-y-1">{group.items.map(renderItem)}</div>
          </div>
        ))}
        <div className="space-y-1 border-t border-white/10 pt-4">{renderItem(SETTINGS_ITEM)}</div>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="rounded-lg bg-white/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <FlaskConical size={13} aria-hidden="true" /> Prototype demonstration
            </p>
            <p className="mt-1 text-[11px] leading-snug text-white/60">Fictional data stored only in this browser. Not an official AICTE system.</p>
          </div>
        ) : (
          <div className="flex justify-center text-white/60" title="Prototype demonstration with fictional data">
            <FlaskConical size={16} aria-hidden="true" />
          </div>
        )}
        {!isMobile && (
          <button
            type="button"
            onClick={onToggle}
            className={`mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-0' : ''}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Collapse</>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCloseMobile();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden bg-sidebar transition-[width] duration-200 lg:block ${collapsed ? 'w-[76px]' : 'w-64'}`}
        aria-label="Sidebar"
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-sidebar/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCloseMobile} aria-hidden="true" />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <SidebarContent collapsed={false} onNavigate={onCloseMobile} isMobile />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
