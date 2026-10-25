import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, FolderOpen, Search, SearchX, User, X } from 'lucide-react';
import { useScopedData } from '@/hooks/useScopedData';
import useClickOutside from '@/components/layout/useClickOutside';

const GROUP_ICONS = { Applications: FileText, Institutes: Building2, Documents: FolderOpen, Users: User };

export default function GlobalSearch({ autoFocus = false, onDone }) {
  const { role, scoped, instituteById, users } = useScopedData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const input = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrap, close, open);

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    const has = (...vals) => vals.some((v) => String(v ?? '').toLowerCase().includes(q));

    const appTo = (a) => {
      if (role === 'institute') return a.status === 'Draft' ? `/institute/applications/new?draft=${a.id}` : `/institute/applications/${a.id}`;
      return `/officer/applications/${a.id}`;
    };
    const instTo = (i) => (role === 'institute' ? '/institute/compliance' : role === 'officer' ? `/officer/compliance?institute=${i.id}` : `/admin/institutes?open=${i.id}`);

    const applications = scoped.applications
      .filter((a) => has(a.id, a.applicationType, a.status, a.programDetails, instituteById[a.instituteId]?.name))
      .slice(0, 5)
      .map((a) => ({ id: a.id, label: a.id, sub: `${a.applicationType} · ${instituteById[a.instituteId]?.name || a.instituteId} · ${a.status}`, to: appTo(a) }));

    const institutes = scoped.institutes
      .filter((i) => has(i.id, i.name, i.city, i.state, i.type))
      .slice(0, 5)
      .map((i) => ({ id: i.id, label: i.name, sub: `${i.id} · ${i.city}, ${i.state}`, to: instTo(i) }));

    const docs = scoped.documents
      .filter((d) => has(d.name, d.fileName, d.applicationId, d.category))
      .slice(0, 5)
      .map((d) => ({ id: d.id, label: d.name, sub: `${d.fileName} · ${d.applicationId}`, to: role === 'institute' ? '/institute/documents' : `/officer/applications/${d.applicationId}` }));

    const people = role === 'admin'
      ? users.filter((u) => has(u.name, u.email, u.role, u.organization)).slice(0, 5).map((u) => ({ id: u.id, label: u.name, sub: `${u.email} · ${u.role}`, to: `/admin/users?open=${u.id}` }))
      : [];

    return [
      { name: 'Applications', items: applications },
      { name: 'Institutes', items: institutes },
      { name: 'Documents', items: docs },
      { name: 'Users', items: people },
    ].filter((g) => g.items.length);
  }, [query, role, scoped, instituteById, users]);

  const go = (to) => {
    setOpen(false);
    setQuery('');
    onDone?.();
    navigate(to);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && groups?.length) go(groups[0].items[0].to);
  };

  return (
    <div className="relative w-full" ref={wrap}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        ref={input}
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search applications, institutes, documents…"
        aria-label="Global search"
        className="input h-10 bg-soft pl-9 pr-16 [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button type="button" onClick={() => { setQuery(''); input.current?.focus(); }} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted hover:bg-line hover:text-ink">
          <X size={14} />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:block">Ctrl K</kbd>
      )}

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-[26rem] overflow-y-auto rounded-xl border border-line bg-card shadow-pop scroll-thin">
          {groups.length ? (
            groups.map((g) => {
              const Icon = GROUP_ICONS[g.name];
              return (
                <div key={g.name} className="border-b border-line py-2 last:border-0">
                  <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{g.name}</p>
                  {g.items.map((item) => (
                    <button key={item.id} type="button" onClick={() => go(item.to)} className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-soft">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent"><Icon size={15} aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{item.label}</span>
                        <span className="block truncate text-xs text-muted">{item.sub}</span>
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <SearchX size={22} className="text-muted" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink">No results for "{query.trim()}"</p>
              <p className="mt-1 text-xs text-muted">Try an application ID, institute name or document name. Results are limited to your current demo role.</p>
            </div>
          )}
        </div>
      )}
      {open && query.trim().length === 1 && (
        <p className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-line bg-card px-4 py-3 text-xs text-muted shadow-pop">Type at least 2 characters to search.</p>
      )}
    </div>
  );
}
