import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, ClipboardList, FileSearch, FileWarning, Gavel, Inbox, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import MetricCard from '@/components/common/MetricCard';
import StatusBadge from '@/components/common/StatusBadge';
import ChartCard from '@/components/common/ChartCard';
import EmptyState from '@/components/common/EmptyState';
import Panel from '@/components/dashboard/Panel';
import DeadlineList from '@/components/dashboard/DeadlineList';
import QuickActions from '@/components/dashboard/QuickActions';
import StatusDonut from '@/components/charts/StatusDonut';
import { statusDistribution } from '@/components/charts/chartTheme';
import { useScopedData } from '@/hooks/useScopedData';
import { greeting, relativeTime } from '@/utils/format';
import { PENDING_STATUSES, PRIORITY_ORDER } from '@/utils/constants';
import { queueState } from '@/services/applicationService';

export default function OfficerDashboard() {
  const { user, scoped, instituteById, workflow, audit } = useScopedData();
  const navigate = useNavigate();
  const apps = scoped.applications;

  const stats = useMemo(() => ({
    assigned: apps.filter((a) => a.assignedReviewerId === user?.id && PENDING_STATUSES.includes(a.status)).length,
    pending: apps.filter((a) => PENDING_STATUSES.includes(a.status)).length,
    required: apps.filter((a) => a.status === 'Documents Required').length,
    decided: apps.filter((a) => ['Approved', 'Rejected'].includes(a.status)).length,
  }), [apps, user]);

  const queue = useMemo(
    () => apps.filter((a) => PENDING_STATUSES.includes(a.status))
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || new Date(a.submittedAt) - new Date(b.submittedAt)).slice(0, 6),
    [apps],
  );
  const activity = audit.filter((e) => e.role === 'officer').slice(0, 6);

  return (
    <>
      <PageHeader
        showDate
        eyebrow="AICTE Officer workspace (demo)"
        title={`${greeting()}, ${user?.name.replace(/^Dr\.\s*/, '').split(' ')[0] || 'Officer'}`}
        description="Scrutinise applications and record simulated outcomes. Priority labels are demo values, not official assessments."
        actions={<Link to="/officer/applications" className="btn btn-primary"><ClipboardList size={16} /> Open Review Queue</Link>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assigned Applications" value={stats.assigned} description="Assigned to you, in progress" icon={Inbox} to="/officer/applications" />
        <MetricCard label="Pending Review" value={stats.pending} description="Across the demo queue" icon={FileSearch} tone="amber" to="/officer/applications" />
        <MetricCard label="Documents Required" value={stats.required} description="Waiting on institutes" icon={FileWarning} tone="red" to="/officer/applications" />
        <MetricCard label="Decisions Recorded" value={stats.decided} description="Simulated outcomes" icon={Gavel} tone="green" to="/officer/applications" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Review Queue" subtitle="Sorted by demo priority, then submission date" linkTo="/officer/applications" padded={false}>
            {queue.length ? (
              <ul className="divide-y divide-line">
                {queue.map((a) => {
                  const state = queueState(a, workflow);
                  return (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <Link to={`/officer/applications/${a.id}`} className="text-sm font-semibold text-accent hover:underline">{a.id}</Link>
                        <p className="truncate text-xs text-muted">{instituteById[a.instituteId]?.name} · {a.applicationType}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={state} size="sm" /><StatusBadge status={a.priority} size="sm" /><StatusBadge status={a.status} size="sm" />
                        <Link to={`/officer/applications/${a.id}`} className="btn btn-secondary btn-sm">Review</Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : <EmptyState compact icon={Inbox} title="The queue is empty" description="New submissions will appear here." />}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Application status distribution" subtitle="Click a slice to open the queue" height={280}>
              <StatusDonut data={statusDistribution(apps)} onSelect={() => navigate('/officer/applications')} />
            </ChartCard>
            <Panel title="Review activity" subtitle="Recent simulated officer actions">
              {activity.length ? (
                <ul className="space-y-3">
                  {activity.map((e) => (
                    <li key={e.id} className="text-sm">
                      <p className="font-medium text-ink">{e.action}</p>
                      <p className="text-xs text-muted">{e.entityId} · {e.actor} · {relativeTime(e.timestamp)}</p>
                    </li>
                  ))}
                </ul>
              ) : <EmptyState compact title="No activity yet" />}
            </Panel>
          </div>
        </div>

        <div className="space-y-6">
          <Panel title="Quick Actions">
            <QuickActions actions={[
              { label: 'Open Review Queue', description: 'All applications to scrutinise', icon: ClipboardList, to: '/officer/applications' },
              { label: 'Review Documents', description: 'Start with the oldest pending', icon: FileSearch, to: queue[0] ? `/officer/applications/${queue[0].id}` : '/officer/applications' },
              { label: 'Monitor Compliance', description: 'Institution-wide view', icon: ShieldCheck, to: '/officer/compliance' },
              { label: 'View Reports', description: 'Charts and CSV export', icon: BarChart3, to: '/reports' },
            ]} />
          </Panel>
          <Panel title="Upcoming Deadlines" subtitle="Demo review schedule">
            <DeadlineList items={scoped.deadlines} role="officer" limit={6} />
          </Panel>
        </div>
      </div>
    </>
  );
}
