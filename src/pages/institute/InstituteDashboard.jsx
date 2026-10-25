import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, ClipboardList, FilePlus2, FileText, FolderUp, Hourglass, ShieldCheck, Search } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import MetricCard from '@/components/common/MetricCard';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import Panel from '@/components/dashboard/Panel';
import DeadlineList from '@/components/dashboard/DeadlineList';
import RecentNotifications from '@/components/dashboard/RecentNotifications';
import QuickActions from '@/components/dashboard/QuickActions';
import ApplicationsTable from '@/components/applications/ApplicationsTable';
import StageTrack from '@/components/applications/StageTrack';
import { useScopedData } from '@/hooks/useScopedData';
import { greeting } from '@/utils/format';
import { ACTIVE_STATUSES, PENDING_STATUSES } from '@/utils/constants';
import { complianceScore } from '@/utils/compliance';

export default function InstituteDashboard() {
  const { user, institute, scoped } = useScopedData();
  const navigate = useNavigate();
  const apps = scoped.applications;

  const stats = useMemo(() => ({
    total: apps.length,
    pending: apps.filter((a) => PENDING_STATUSES.includes(a.status)).length,
    approved: apps.filter((a) => a.status === 'Approved').length,
    outstanding: apps.filter((a) => a.status === 'Documents Required').length,
  }), [apps]);

  const active = apps.filter((a) => ACTIVE_STATUSES.includes(a.status));
  const recent = [...apps].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  const compliance = useMemo(() => {
    const by = (cat) => complianceScore(scoped.compliance.filter((r) => r.category === cat));
    return [
      ['Faculty compliance', by('Faculty')],
      ['Infrastructure compliance', by('Infrastructure')],
      ['Approved intake compliance', by('Approved Intake')],
      ['Mandatory disclosures', by('Mandatory Disclosures')],
    ];
  }, [scoped.compliance]);

  return (
    <>
      <PageHeader
        showDate
        eyebrow="Institute workspace"
        title={`${greeting()}, ${user?.name.split(' ')[0] || 'there'}`}
        description={`${institute?.name || 'Your institute'}. Track applications, documents and compliance. Values shown are illustrative demo data.`}
        actions={<Link to="/institute/applications/new" className="btn btn-primary"><FilePlus2 size={16} /> Create New Application</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Applications" value={stats.total} description="All applications on record" icon={FileText} to="/institute/applications" />
        <MetricCard label="Pending Applications" value={stats.pending} description="Awaiting validation or review" icon={Hourglass} tone="amber" to="/institute/applications" />
        <MetricCard label="Approved Applications" value={stats.approved} description="Approved in demo mode" icon={CheckCircle2} tone="green" to="/institute/applications" />
        <MetricCard label="Outstanding Requirements" value={stats.outstanding} description="Document requests to answer" icon={AlertTriangle} tone={stats.outstanding ? 'red' : 'slate'} to="/institute/applications" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Application Progress" subtitle="Current lifecycle stage of each active application">
            {active.length ? (
              <ul className="space-y-5">
                {active.map((a) => (
                  <li key={a.id} className="rounded-lg border border-line p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <Link to={`/institute/applications/${a.id}`} className="text-sm font-semibold text-accent hover:underline">{a.id}</Link>
                      <span className="text-xs text-muted">{a.applicationType}</span>
                      <StatusBadge status={a.status} size="sm" />
                    </div>
                    <StageTrack status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact icon={ClipboardList} title="No active applications" description="Create an application to see its progress here." action={<Link to="/institute/applications/new" className="btn btn-primary btn-sm">Create application</Link>} />
            )}
          </Panel>

          <Panel title="Recent Applications" linkTo="/institute/applications" padded={false}>
            <ApplicationsTable
              applications={recent}
              pageSize={5}
              compact
              empty={<EmptyState icon={FileText} title="No applications yet" description="Your submitted and draft applications will appear here." action={<Link to="/institute/applications/new" className="btn btn-primary btn-sm">Create application</Link>} />}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Quick Actions">
            <QuickActions
              actions={[
                { label: 'Create New Application', description: 'Start the guided wizard', icon: FilePlus2, to: '/institute/applications/new' },
                { label: 'Upload Documents', description: 'Manage document uploads', icon: FolderUp, to: '/institute/documents' },
                { label: 'View Application Status', description: 'Search and filter applications', icon: Search, to: '/institute/applications' },
                { label: 'Review Compliance', description: 'Demo rules and evidence', icon: ShieldCheck, to: '/institute/compliance' },
                { label: 'Open Notifications', description: 'Updates and reminders', icon: Bell, onClick: () => navigate('/notifications') },
              ]}
            />
          </Panel>

          <Panel title="Compliance Overview" subtitle="Illustrative demo data against configurable rules" linkTo="/institute/compliance" linkLabel="Details">
            <div className="space-y-4">
              {compliance.map(([label, value]) => <ProgressBar key={label} label={label} value={value} />)}
            </div>
          </Panel>

          <Panel title="Upcoming Deadlines" subtitle="Demo schedule" >
            <DeadlineList items={scoped.deadlines} role="institute" />
          </Panel>

          <Panel title="Recent Notifications" linkTo="/notifications" padded>
            <RecentNotifications />
          </Panel>
        </div>
      </div>
    </>
  );
}
