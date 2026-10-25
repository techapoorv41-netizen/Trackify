import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BellRing, FilterX, Mail, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import FilterDropdown from '@/components/common/FilterDropdown';
import SearchInput from '@/components/common/SearchInput';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import Panel from '@/components/dashboard/Panel';
import { SelectField, TextField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { alertSchema } from '@/utils/schemas';
import { ALERT_CATEGORIES, ALERT_DELIVERY, PRIORITIES, ROLES, ROLE_KEYS } from '@/utils/constants';
import { dateKey, formatDate } from '@/utils/format';
import { integrationPlaceholders } from '@/services/apiClient';

export default function AlertManagement() {
  const { alerts, applications, actions } = useScopedData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [delivery, setDelivery] = useState('');
  const [role, setRole] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return alerts.filter((a) => (!s || [a.title, a.applicationId].some((v) => (v || '').toLowerCase().includes(s))) && (!category || a.category === category) && (!delivery || a.deliveryStatus === delivery) && (!role || a.recipientRole === role));
  }, [alerts, q, category, delivery, role]);

  const form = useForm({ resolver: zodResolver(alertSchema), defaultValues: { title: '', category: '', recipientRole: 'institute', applicationId: '', priority: 'Medium', scheduledDate: '' } });
  const submit = form.handleSubmit((v) => {
    actions.addAlert({ ...v, scheduledDate: new Date(`${v.scheduledDate}T10:00:00`).toISOString(), deliveryStatus: 'Scheduled' });
    toast.success('Alert created', 'Scheduled in the local demo scheduler. Nothing was sent.');
    form.reset();
    setCreating(false);
  });
  const clear = () => { setQ(''); setCategory(''); setDelivery(''); setRole(''); };

  const columns = [
    { key: 'title', header: 'Alert', sortable: true, render: (a) => <span><span className="block font-medium">{a.title}</span><span className="text-xs text-muted">{a.category}</span></span> },
    { key: 'recipientRole', header: 'Recipient', sortable: true, render: (a) => ROLES[a.recipientRole].label },
    { key: 'applicationId', header: 'Application', render: (a) => a.applicationId || <span className="text-muted">None</span> },
    { key: 'priority', header: 'Priority', sortable: true, render: (a) => <StatusBadge status={a.priority} size="sm" /> },
    { key: 'scheduledDate', header: 'Scheduled', sortable: true, sortValue: (a) => new Date(a.scheduledDate).getTime(), render: (a) => formatDate(a.scheduledDate) },
    { key: 'deliveryStatus', header: 'Delivery', sortable: true, render: (a) => <StatusBadge status={a.deliveryStatus} size="sm" /> },
    {
      key: 'actions', header: 'Actions',
      render: (a) => (
        <div className="flex gap-1.5">
          <button type="button" className="btn btn-secondary btn-sm" disabled={a.deliveryStatus.startsWith('Sent')} onClick={() => { actions.sendAlert(a.id); toast.success('In-app notification simulated', `Delivered to ${ROLES[a.recipientRole].label} users in this demo. No email or SMS was sent.`); }}><Send size={13} /> {a.deliveryStatus.startsWith('Sent') ? 'Sent' : 'Send in-app'}</button>
          <button type="button" className="btn btn-ghost btn-sm" aria-label={`Delete ${a.title}`} onClick={() => setDeleting(a)}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Alert Management" description="Create alerts and simulate in-app delivery. Email and SMS are not connected." actions={<button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> New alert</button>} />
      <div className="card">
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-2 xl:grid-cols-5">
          <SearchInput value={q} onChange={setQ} placeholder="Search alerts…" label="Search alerts" />
          <FilterDropdown label="Category" value={category} onChange={setCategory} options={ALERT_CATEGORIES} />
          <FilterDropdown label="Recipient" value={role} onChange={setRole} options={ROLE_KEYS.map((r) => ({ value: r, label: ROLES[r].label }))} />
          <FilterDropdown label="Delivery" value={delivery} onChange={setDelivery} options={ALERT_DELIVERY} />
          <button type="button" className="btn btn-ghost" disabled={!(q || category || delivery || role)} onClick={clear}><FilterX size={14} /> Clear filters</button>
        </div>
        <DataTable columns={columns} rows={rows} caption="Alerts" initialSort={{ key: 'scheduledDate', dir: 'asc' }} empty={<EmptyState icon={BellRing} title="No alerts match" action={<button type="button" className="btn btn-secondary btn-sm" onClick={clear}>Clear filters</button>} />} />
      </div>

      <div className="mt-6">
        <Panel title="Delivery channels" subtitle="Integration placeholders for the future backend">
          <ul className="grid gap-3 md:grid-cols-3">
            <li className="flex items-center gap-3 rounded-lg border border-line p-3"><BellRing size={18} className="text-success" /><span className="flex-1 text-sm text-ink">In-app notifications</span><StatusBadge status="Active" size="sm" label="Simulated" /></li>
            <li className="flex items-center gap-3 rounded-lg border border-line p-3"><Mail size={18} className="text-muted" /><span className="flex-1 text-sm text-ink">{integrationPlaceholders.email.name}</span><span className="text-xs font-semibold text-muted">Not connected</span></li>
            <li className="flex items-center gap-3 rounded-lg border border-line p-3"><MessageSquare size={18} className="text-muted" /><span className="flex-1 text-sm text-ink">{integrationPlaceholders.sms.name}</span><span className="text-xs font-semibold text-muted">Not connected</span></li>
          </ul>
        </Panel>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New alert" description="Alerts are delivered as in-app demo notifications only." size="lg"
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}>Create alert</button></>}>
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><TextField label="Alert title" required error={form.formState.errors.title?.message} {...form.register('title')} /></div>
          <SelectField label="Category" required options={ALERT_CATEGORIES} error={form.formState.errors.category?.message} {...form.register('category')} />
          <SelectField label="Recipient role" required options={ROLE_KEYS.map((r) => ({ value: r, label: ROLES[r].label }))} {...form.register('recipientRole')} />
          <SelectField label="Related application" placeholder="None" options={applications.filter((a) => a.status !== 'Draft').map((a) => a.id)} {...form.register('applicationId')} />
          <SelectField label="Priority" required options={PRIORITIES} {...form.register('priority')} />
          <TextField label="Scheduled date" type="date" required min={dateKey(new Date().toISOString())} error={form.formState.errors.scheduledDate?.message} {...form.register('scheduledDate')} />
          <button type="submit" className="sr-only">Submit</button>
        </form>
      </Modal>
      <ConfirmationDialog open={Boolean(deleting)} onCancel={() => setDeleting(null)} tone="danger" title="Delete this alert?" description={deleting ? `"${deleting.title}" will be removed from the demo scheduler.` : ''} confirmLabel="Delete alert"
        onConfirm={() => { actions.deleteAlert(deleting.id); toast.success('Alert deleted'); setDeleting(null); }} />
    </>
  );
}
