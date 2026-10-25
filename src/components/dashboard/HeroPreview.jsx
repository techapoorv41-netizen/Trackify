import { BarChart3, Bell, FileText, FolderOpen, LayoutDashboard, ShieldCheck } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

const BARS = [38, 52, 44, 68, 58, 80, 72];
const ROWS = [
  ['TRK-2026-0001', 'Extension of Approval', 'Under Review'],
  ['TRK-2026-0002', 'Increase in Intake', 'Documents Required'],
  ['TRK-2026-0003', 'New Course / Program', 'Approved'],
];

/** Static illustration of the product UI. Values are illustrative only. */
export default function HeroPreview() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-accent-50" />
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-pop">
        <div className="flex items-center gap-1.5 border-b border-line bg-soft px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-3 truncate rounded-md bg-card px-3 py-0.5 text-[10px] text-muted">trackify.demo / institute / dashboard</span>
        </div>
        <div className="flex">
          <div className="hidden w-12 shrink-0 flex-col items-center gap-3 bg-sidebar py-4 text-white/70 sm:flex">
            {[LayoutDashboard, FileText, FolderOpen, ShieldCheck, BarChart3, Bell].map((Icon, i) => (
              <span key={i} className={`flex h-8 w-8 items-center justify-center rounded-lg ${i === 0 ? 'bg-white/15 text-white' : ''}`}><Icon size={15} /></span>
            ))}
          </div>
          <div className="min-w-0 flex-1 bg-page p-4">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[['Total', '7'], ['Pending', '3'], ['Approved', '1'], ['Outstanding', '2']].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-line bg-card p-2.5">
                  <p className="text-[10px] font-medium text-muted">{l}</p>
                  <p className="mt-1 text-lg font-bold text-ink">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-5">
              <div className="rounded-lg border border-line bg-card p-3 sm:col-span-3">
                <p className="text-[10px] font-semibold text-ink">Applications by month</p>
                <div className="mt-3 flex h-20 items-end gap-2">
                  {BARS.map((h, i) => (
                    <span key={i} className="flex-1 rounded-t bg-accent" style={{ height: `${h}%`, opacity: 0.35 + i * 0.09 }} />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-line bg-card p-3 sm:col-span-2">
                <p className="text-[10px] font-semibold text-ink">Compliance</p>
                <div className="mt-3 space-y-2.5">
                  {[['Faculty', 82], ['Infra', 64], ['Intake', 91]].map(([l, v]) => (
                    <div key={l}>
                      <div className="flex justify-between text-[10px] text-muted"><span>{l}</span><span>{v}%</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-soft"><div className="h-full rounded-full bg-success" style={{ width: `${v}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-card">
              {ROWS.map(([id, type, status]) => (
                <div key={id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-accent">{id}</p>
                    <p className="truncate text-[10px] text-muted">{type}</p>
                  </div>
                  <StatusBadge status={status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted">Illustrative preview with fictional demo values</p>
    </div>
  );
}
