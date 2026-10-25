import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Clock, Download, FileText, FilterX, Gavel, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import MetricCard from '@/components/common/MetricCard';
import ChartCard from '@/components/common/ChartCard';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import StatusDonut from '@/components/charts/StatusDonut';
import { statusDistribution, SERIES } from '@/components/charts/chartTheme';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { COMPLIANCE_CATEGORIES } from '@/utils/constants';
import { inRange, monthKey, monthLabel } from '@/utils/format';
import { isOpenIssue } from '@/utils/compliance';
import { downloadCSV, toCSV } from '@/utils/csv';

export default function Reports() {
  const { scoped, instituteById, role } = useScopedData();
  const toast = useToast();
  const [range, setRange] = useState({ from: '', to: '' });
  const filtering = range.from || range.to;

  const apps = useMemo(() => scoped.applications.filter((a) => !filtering || (a.submittedAt && inRange(a.submittedAt, range.from, range.to))), [scoped.applications, range, filtering]);

  const monthly = useMemo(() => {
    const map = {};
    apps.filter((a) => a.submittedAt).forEach((a) => { const k = monthKey(a.submittedAt); map[k] = (map[k] || 0) + 1; });
    return Object.keys(map).sort().map((k) => ({ month: monthLabel(k), count: map[k] }));
  }, [apps]);

  const processing = useMemo(() => {
    const map = {};
    apps.filter((a) => a.decision && a.submittedAt).forEach((a) => {
      const days = Math.max(1, Math.round((new Date(a.decision.at) - new Date(a.submittedAt)) / 86400000));
      (map[a.applicationType] ||= []).push(days);
    });
    return Object.entries(map).map(([name, v]) => ({ name, days: Math.round(v.reduce((s, x) => s + x, 0) / v.length), n: v.length }));
  }, [apps]);
  const avgDays = processing.length ? Math.round(processing.reduce((s, p) => s + p.days * p.n, 0) / processing.reduce((s, p) => s + p.n, 0)) : null;

  const issues = COMPLIANCE_CATEGORIES.map((c) => ({ name: c, count: scoped.compliance.filter((r) => r.category === c && isOpenIssue(r)).length }));
  const workload = useMemo(() => {
    const map = {};
    apps.filter((a) => a.assignedReviewer).forEach((a) => { map[a.assignedReviewer] = (map[a.assignedReviewer] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [apps]);

  const exportCsv = () => {
    downloadCSV('trackify-demo-applications.csv', toCSV(apps, [
      { header: 'Application ID', value: (a) => a.id }, { header: 'Institute', value: (a) => instituteById[a.instituteId]?.name },
      { header: 'Category', value: (a) => a.applicationType }, { header: 'Academic year', value: (a) => a.academicYear },
      { header: 'Status', value: (a) => a.status }, { header: 'Priority (demo)', value: (a) => a.priority },
      { header: 'Submitted', value: (a) => a.submittedAt || '' }, { header: 'Reviewer', value: (a) => a.assignedReviewer || '' },
    ]));
    toast.success('CSV downloaded', `${apps.length} demo application(s) exported.`);
  };

  const noData = <p className="py-12 text-center text-sm text-muted">No data for the selected range.</p>;

  return (
    <>
      <PageHeader title="Reports and Analytics" description={`Generated from the local demo dataset${role === 'institute' ? ' for your institute' : ''}. These are illustrative figures, not official AICTE statistics.`}
        actions={<button type="button" className="btn btn-secondary" onClick={exportCsv} disabled={!apps.length}><Download size={16} /> Export CSV</button>} />
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-muted">Submitted between</span><DateRangeFilter from={range.from} to={range.to} onChange={setRange} label="Report date" /></div>
        <button type="button" className="btn btn-ghost btn-sm" disabled={!filtering} onClick={() => setRange({ from: '', to: '' })}><FilterX size={14} /> Clear filters</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Applications" value={apps.length} description="In selected range" icon={FileText} />
        <MetricCard label="Decisions recorded" value={apps.filter((a) => a.decision).length} description="Simulated outcomes" icon={Gavel} tone="green" />
        <MetricCard label="Avg. processing time" value={avgDays == null ? '—' : `${avgDays}d`} description="Submission to demo decision" icon={Clock} tone="amber" />
        <MetricCard label="Open compliance issues" value={scoped.compliance.filter(isOpenIssue).length} description="Against demo rules" icon={ShieldAlert} tone="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Application status distribution" height={280}>{apps.length ? <StatusDonut data={statusDistribution(apps)} /> : noData}</ChartCard>
        <ChartCard title="Applications by month" subtitle="By submission date" height={280}>
          {monthly.length ? (
            <ResponsiveContainer width="100%" height="100%"><BarChart data={monthly} margin={{ left: -20 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip cursor={{ fill: 'rgb(var(--soft))' }} /><Bar dataKey="count" name="Applications" fill={SERIES[1]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          ) : noData}
        </ChartCard>
        <ChartCard title="Average demo processing time" subtitle="Days from submission to decision, by category" height={280}>
          {processing.length ? (
            <ResponsiveContainer width="100%" height="100%"><LineChart data={processing} margin={{ left: -20, right: 12 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={55} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="days" name="Avg days" stroke={SERIES[0]} strokeWidth={2.5} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>
          ) : noData}
        </ChartCard>
        <ChartCard title="Compliance issue categories" subtitle="Open partial or non-compliant items" height={280}>
          {scoped.compliance.length ? (
            <ResponsiveContainer width="100%" height="100%"><BarChart data={issues} layout="vertical" margin={{ left: 20 }}><CartesianGrid horizontal={false} strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} /><Tooltip cursor={{ fill: 'rgb(var(--soft))' }} /><Bar dataKey="count" name="Open issues" radius={[0, 4, 4, 0]}>{issues.map((d, i) => <Cell key={d.name} fill={SERIES[i % SERIES.length]} />)}</Bar></BarChart></ResponsiveContainer>
          ) : noData}
        </ChartCard>
        {role !== 'institute' && (
          <div className="lg:col-span-2">
            <ChartCard title="Review workload distribution" subtitle="Applications per assigned reviewer" height={260}>
              {workload.length ? (
                <ResponsiveContainer width="100%" height="100%"><BarChart data={workload} margin={{ left: -20 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip cursor={{ fill: 'rgb(var(--soft))' }} /><Bar dataKey="count" name="Applications" fill={SERIES[0]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
              ) : noData}
            </ChartCard>
          </div>
        )}
      </div>
    </>
  );
}
