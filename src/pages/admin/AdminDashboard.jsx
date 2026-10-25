import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Building2, CheckCircle2, FileText, Info, Users } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import MetricCard from '@/components/common/MetricCard';
import ChartCard from '@/components/common/ChartCard';
import StatusBadge from '@/components/common/StatusBadge';
import Panel from '@/components/dashboard/Panel';
import { useScopedData } from '@/hooks/useScopedData';
import { ACTIVE_STATUSES, ROLES, STATUSES } from '@/utils/constants';
import { STATUS_COLORS, SERIES } from '@/components/charts/chartTheme';
import { greeting, relativeTime } from '@/utils/format';
import { isOpenIssue } from '@/utils/compliance';
import { integrationPlaceholders } from '@/services/apiClient';

export default function AdminDashboard() {
  const { user, users, institutes, applications, allCompliance, audit, alerts, workflow } = useScopedData();

  const statusData = STATUSES.map((s) => ({ name: s, count: applications.filter((a) => a.status === s).length }));
  const roleData = Object.keys(ROLES).map((r) => ({ name: ROLES[r].label, value: users.filter((u) => u.role === r).length }));
  const sent = alerts.filter((a) => a.deliveryStatus.startsWith('Sent')).length;
  const scheduled = alerts.filter((a) => a.deliveryStatus === 'Scheduled').length;
  const drafts = alerts.filter((a) => a.deliveryStatus === 'Draft').length;

  return (
    <>
      <PageHeader showDate eyebrow="Admin control panel (demo)" title={`${greeting()}, ${user?.name.split(' ')[0] || 'Admin'}`} description="Configure demo users, rules, workflows and alerts. Nothing here changes a real AICTE system." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Demo Users" value={users.length} description={`${users.filter((u) => u.status === 'Active').length} active`} icon={Users} to="/admin/users" />
        <MetricCard label="Registered Demo Institutes" value={institutes.length} description="Fictional records" icon={Building2} tone="slate" to="/admin/institutes" />
        <MetricCard label="Active Applications" value={applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length} description="Submitted through review" icon={FileText} tone="green" to="/officer/applications" />
        <MetricCard label="Open Compliance Issues" value={allCompliance.filter(isOpenIssue).length} description="Against demo rules" icon={AlertTriangle} tone="amber" to="/officer/compliance" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Application processing overview" subtitle="Applications by current status" height={290}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ left: -20, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgb(var(--soft))' }} />
                <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]}>
                  {statusData.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="User role distribution" height={290}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                {roleData.map((d, i) => <Cell key={d.name} fill={SERIES[i]} stroke="none" />)}
              </Pie>
              <Tooltip /><Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent system activity" subtitle="Demo audit events" linkTo="/admin/audit-logs" className="lg:col-span-2">
          <ul className="divide-y divide-line">
            {audit.slice(0, 7).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0"><p className="text-sm font-medium text-ink">{e.action}</p><p className="truncate text-xs text-muted">{e.entityType} {e.entityId} · {e.actor}</p></div>
                <span className="text-xs text-muted">{relativeTime(e.timestamp)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Alert delivery simulation" linkTo="/admin/alerts" linkLabel="Manage">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Sent', sent, 'text-success'], ['Scheduled', scheduled, 'text-accent'], ['Draft', drafts, 'text-muted']].map(([l, n, c]) => (
                <div key={l} className="rounded-lg bg-soft p-3"><p className={`text-xl font-bold ${c}`}>{n}</p><p className="text-xs text-muted">{l}</p></div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">In-app simulation only. No email or SMS is sent.</p>
          </Panel>

          <Panel title="Workflow status" linkTo="/admin/workflows" linkLabel="Configure">
            <ul className="space-y-2">
              {workflow.stages.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm"><span className="truncate text-ink">{s.label}</span><StatusBadge status={s.enabled ? 'Enabled' : 'Disabled'} size="sm" /></li>
              ))}
            </ul>
          </Panel>

          <Panel title="Integration readiness" subtitle="Prototype status, not live monitoring">
            <ul className="space-y-2">
              <li className="flex items-center justify-between text-sm"><span className="text-ink">Local demo data store</span><StatusBadge status="Active" size="sm" /></li>
              {Object.values(integrationPlaceholders).map((i) => (
                <li key={i.name} className="flex items-center justify-between gap-2 text-sm"><span className="truncate text-ink">{i.name}</span><span className="shrink-0 text-xs font-semibold text-muted">Not connected</span></li>
              ))}
            </ul>
            <p className="mt-3 flex gap-1.5 text-xs text-muted"><Info size={13} className="mt-0.5 shrink-0" /> No live infrastructure metrics are shown because there is no backend.</p>
          </Panel>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted"><CheckCircle2 size={12} className="mr-1 inline" />Counts are computed from the shared local demo dataset. <Link to="/settings" className="font-semibold text-accent hover:underline">Reset demo data</Link></p>
    </>
  );
}
