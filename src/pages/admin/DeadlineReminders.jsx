import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlarmClock, Check, Info, Pause, Play, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import MetricCard from '@/components/common/MetricCard';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import Tabs from '@/components/common/Tabs';
import Modal from '@/components/common/Modal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import EmptyState from '@/components/common/EmptyState';
import { deadlineState } from '@/components/dashboard/DeadlineList';
import { SelectField, TextField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { reminderSchema } from '@/utils/schemas';
import { PRIORITIES, REMINDER_FREQUENCIES, ROLES, ROLE_KEYS } from '@/utils/constants';
import { dateKey, dueLabel, formatDate } from '@/utils/format';

export default function DeadlineReminders() {
  const { deadlines, actions } = useScopedData();
  const toast = useToast();
  const [tab, setTab] = useState('open');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const withState = useMemo(() => deadlines.map((d) => ({ ...d, state: deadlineState(d) })), [deadlines]);
  const counts = { overdue: withState.filter((d) => d.state === 'Overdue').length, soon: withState.filter((d) => d.state === 'Due Soon').length, upcoming: withState.filter((d) => d.state === 'Upcoming').length, done: withState.filter((d) => d.state === 'Done').length };
  const rows = withState.filter((d) => (tab === 'open' ? d.state !== 'Done' : tab === 'overdue' ? d.state === 'Overdue' : d.state === 'Done'));

  const form = useForm({ resolver: zodResolver(reminderSchema), defaultValues: { title: '', dueDate: '', priority: 'Medium', recipientRole: 'institute', reminderFrequency: 'Every 3 days' } });
  const submit = form.handleSubmit((v) => {
    actions.addDeadline({ ...v, dueDate: new Date(`${v.dueDate}T10:00:00`).toISOString() });
    toast.success('Reminder created', 'Locally simulated. A backend scheduler is needed for real delivery.');
    form.reset();
    setCreating(false);
  });

  const columns = [
    { key: 'title', header: 'Task', sortable: true, render: (d) => <span><span className="block font-medium">{d.title}</span>{d.applicationId && <span className="text-xs text-muted">{d.applicationId}</span>}</span> },
    { key: 'dueDate', header: 'Due', sortable: true, sortValue: (d) => new Date(d.dueDate).getTime(), render: (d) => <span><span className="block">{formatDate(d.dueDate)}</span><span className={`text-xs ${d.state === 'Overdue' ? 'font-semibold text-danger' : 'text-muted'}`}>{d.completed ? 'Completed' : dueLabel(d.dueDate)}</span></span> },
    { key: 'state', header: 'State', sortable: true, render: (d) => <StatusBadge status={d.state} size="sm" /> },
    { key: 'priority', header: 'Priority', render: (d) => <StatusBadge status={d.priority} size="sm" /> },
    { key: 'recipientRole', header: 'Recipient', render: (d) => ROLES[d.recipientRole]?.label },
    {
      key: 'reminderFrequency', header: 'Frequency',
      render: (d) => (
        <label><span className="sr-only">Reminder frequency for {d.title}</span>
          <select className="input w-auto py-1.5 text-xs" disabled={d.completed} value={d.reminderFrequency} onChange={(e) => { actions.updateDeadline(d.id, { reminderFrequency: e.target.value }); toast.success('Frequency updated', e.target.value); }}>
            {REMINDER_FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
      ),
    },
    { key: 'reminderStatus', header: 'Reminder', render: (d) => <StatusBadge status={d.completed ? 'Done' : d.reminderStatus} size="sm" /> },
    {
      key: 'actions', header: 'Actions',
      render: (d) => (
        <div className="flex gap-1.5">
          <button type="button" className="btn btn-secondary btn-sm" disabled={d.completed} aria-label={`${d.reminderStatus === 'Active' ? 'Pause' : 'Resume'} reminder for ${d.title}`} onClick={() => actions.updateDeadline(d.id, { reminderStatus: d.reminderStatus === 'Active' ? 'Paused' : 'Active' })}>{d.reminderStatus === 'Active' ? <Pause size={13} /> : <Play size={13} />}</button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={d.completed} aria-label={`Mark ${d.title} done`} onClick={() => { actions.completeDeadline(d.id); toast.success('Marked done', d.title); }}><Check size={13} /></button>
          <button type="button" className="btn btn-ghost btn-sm" aria-label={`Delete ${d.title}`} onClick={() => setDeleting(d)}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Deadline Reminders" description="Upcoming and overdue demo tasks with configurable reminders." actions={<button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> New reminder</button>} />
      <div className="mb-5 flex gap-3 rounded-lg border border-accent/25 bg-accent-50 p-3.5 text-xs text-ink">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        <p>Reminders are locally simulated. Overdue status is calculated from today's date in your browser. A production scheduler would run on the backend.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Overdue" value={counts.overdue} description="Past their due date" icon={AlarmClock} tone={counts.overdue ? 'red' : 'slate'} />
        <MetricCard label="Due soon" value={counts.soon} description="Within 3 days" icon={AlarmClock} tone="amber" />
        <MetricCard label="Upcoming" value={counts.upcoming} description="Later than 3 days" icon={AlarmClock} />
        <MetricCard label="Completed" value={counts.done} description="Marked done" icon={Check} tone="green" />
      </div>
      <div className="card mt-6">
        <div className="px-4 pt-2"><Tabs label="Reminder views" value={tab} onChange={setTab} tabs={[{ value: 'open', label: 'Open', count: withState.length - counts.done }, { value: 'overdue', label: 'Overdue', count: counts.overdue }, { value: 'done', label: 'Completed', count: counts.done }]} /></div>
        <DataTable columns={columns} rows={rows} caption="Reminders" initialSort={{ key: 'dueDate', dir: 'asc' }} empty={<EmptyState icon={AlarmClock} title="Nothing here" description="No reminders in this view." />} />
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New reminder" size="lg"
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}>Create reminder</button></>}>
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><TextField label="Title" required error={form.formState.errors.title?.message} {...form.register('title')} /></div>
          <TextField label="Due date" type="date" required min={dateKey(new Date(Date.now() - 30 * 86400000).toISOString())} error={form.formState.errors.dueDate?.message} {...form.register('dueDate')} />
          <SelectField label="Priority" required options={PRIORITIES} {...form.register('priority')} />
          <SelectField label="Recipient role" required options={ROLE_KEYS.map((r) => ({ value: r, label: ROLES[r].label }))} {...form.register('recipientRole')} />
          <SelectField label="Frequency" required options={REMINDER_FREQUENCIES} {...form.register('reminderFrequency')} />
          <button type="submit" className="sr-only">Submit</button>
        </form>
      </Modal>
      <ConfirmationDialog open={Boolean(deleting)} onCancel={() => setDeleting(null)} tone="danger" title="Delete this reminder?" description={deleting?.title} confirmLabel="Delete reminder"
        onConfirm={() => { actions.deleteDeadline(deleting.id); toast.success('Reminder deleted'); setDeleting(null); }} />
    </>
  );
}
