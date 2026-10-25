import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePrefs } from '@/context/PrefsContext';
import EmptyState from '@/components/common/EmptyState';

function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * columns: [{ key, header, sortable?, sortValue?(row), render?(row), className? }]
 */
export default function DataTable({
  columns, rows, rowKey = (r) => r.id, pageSize, initialSort, empty, rowClassName, caption, footerNote,
}) {
  const { prefs } = usePrefs();
  const size = pageSize || prefs.rowsPerPage;
  const [sort, setSort] = useState(initialSort || null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = col.sortValue || ((r) => r[col.key]);
    const out = [...rows].sort((a, b) => compare(get(a), get(b)));
    return sort.dir === 'desc' ? out.reverse() : out;
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / size));
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);
  useEffect(() => setPage(1), [rows.length]);

  const visible = sorted.slice((page - 1) * size, page * size);
  const toggle = (key) =>
    setSort((s) => (s && s.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }));

  if (!rows.length) {
    return empty || <EmptyState title="No records found" description="Try adjusting your search or filters." />;
  }

  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, sorted.length);

  return (
    <div>
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="border-b border-line bg-soft/60">
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th key={c.key} scope="col" className={`th ${c.className || ''}`} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {c.sortable ? (
                      <button type="button" onClick={() => toggle(c.key)} className="inline-flex items-center gap-1.5 uppercase tracking-wide hover:text-ink">
                        {c.header}
                        <Icon size={12} className={active ? 'text-accent' : 'opacity-60'} aria-hidden="true" />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((row) => (
              <tr key={rowKey(row)} className={`transition-colors hover:bg-soft/50 ${rowClassName ? rowClassName(row) : ''}`}>
                {columns.map((c) => (
                  <td key={c.key} className={`td ${c.className || ''}`}>
                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Showing {from}–{to} of {sorted.length}
          {footerNote && <span> · {footerNote}</span>}
        </p>
        {pageCount > 1 && (
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button type="button" className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-xs font-medium text-ink">Page {page} of {pageCount}</span>
            <button type="button" className="btn btn-secondary btn-sm" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
              <ChevronRight size={14} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
