import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FilterX, Info, Pencil, Plus, Scale } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import FilterDropdown from '@/components/common/FilterDropdown';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { SelectField, TextAreaField, TextField, Toggle } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { ruleSchema } from '@/utils/schemas';
import { COMPLIANCE_CATEGORIES, SEVERITIES } from '@/utils/constants';
import { formatDate } from '@/utils/format';

export default function RuleManagement() {
  const { rules, actions } = useScopedData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [enabled, setEnabled] = useState('');
  const [editing, setEditing] = useState(null);
  const [toggling, setToggling] = useState(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rules.filter((r) => (!s || [r.name, r.description].some((v) => v.toLowerCase().includes(s))) && (!category || r.category === category) && (!severity || r.severity === severity) && (!enabled || (enabled === 'Enabled') === r.enabled));
  }, [rules, q, category, severity, enabled]);

  const form = useForm({ resolver: zodResolver(ruleSchema), defaultValues: { name: '', category: '', description: '', severity: 'Medium' } });
  const openForm = (r) => { setEditing(r || 'new'); form.reset(r ? { name: r.name, category: r.category, description: r.description, severity: r.severity } : { name: '', category: '', description: '', severity: 'Medium' }); };
  const submit = form.handleSubmit((v) => {
    if (editing === 'new') { actions.addRule(v); toast.success('Demo rule added', v.name); }
    else { actions.updateRule(editing.id, v); toast.success('Demo rule updated', v.name); }
    setEditing(null);
  });
  const clear = () => { setQ(''); setCategory(''); setSeverity(''); setEnabled(''); };

  const columns = [
    { key: 'name', header: 'Rule', sortable: true, render: (r) => <span><span className="block font-medium">{r.name}</span><span className="block max-w-md text-xs text-muted">{r.description}</span></span>, className: 'min-w-[16rem]' },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'severity', header: 'Severity', sortable: true, render: (r) => <StatusBadge status={r.severity} size="sm" /> },
    { key: 'enabled', header: 'Enabled', render: (r) => <Toggle checked={r.enabled} onChange={() => setToggling(r)} label={<span className="sr-only">{`Toggle ${r.name}`}</span>} /> },
    { key: 'updatedAt', header: 'Last updated', sortable: true, sortValue: (r) => new Date(r.updatedAt).getTime(), render: (r) => formatDate(r.updatedAt) },
    { key: 'edit', header: 'Edit', render: (r) => <button type="button" className="btn btn-secondary btn-sm" aria-label={`Edit ${r.name}`} onClick={() => openForm(r)}><Pencil size={13} /></button> },
  ];

  return (
    <>
      <PageHeader title="Compliance Rules" description="Illustrative, configurable demonstration rules." actions={<button type="button" className="btn btn-primary" onClick={() => openForm()}><Plus size={16} /> Add demo rule</button>} />
      <div className="mb-5 flex gap-3 rounded-lg border border-warning/30 bg-warning-50 p-3.5 text-xs text-ink">
        <Info size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
        <p>These rules are examples and are not verified against any current regulation. Disabled rules are hidden from institute and officer compliance views.</p>
      </div>
      <div className="card">
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-2 xl:grid-cols-5">
          <SearchInput value={q} onChange={setQ} placeholder="Search rules…" label="Search rules" />
          <FilterDropdown label="Category" value={category} onChange={setCategory} options={COMPLIANCE_CATEGORIES} />
          <FilterDropdown label="Severity" value={severity} onChange={setSeverity} options={SEVERITIES} />
          <FilterDropdown label="State" value={enabled} onChange={setEnabled} options={['Enabled', 'Disabled']} />
          <button type="button" className="btn btn-ghost" disabled={!(q || category || severity || enabled)} onClick={clear}><FilterX size={14} /> Clear filters</button>
        </div>
        <DataTable columns={columns} rows={rows} caption="Compliance rules" pageSize={10} empty={<EmptyState icon={Scale} title="No rules match" action={<button type="button" className="btn btn-secondary btn-sm" onClick={clear}>Clear filters</button>} />} />
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add demo rule' : 'Edit demo rule'}
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}>{editing === 'new' ? 'Add rule' : 'Save changes'}</button></>}>
        <form onSubmit={submit} noValidate className="space-y-4">
          <TextField label="Rule name" required error={form.formState.errors.name?.message} {...form.register('name')} />
          <SelectField label="Category" required options={COMPLIANCE_CATEGORIES} error={form.formState.errors.category?.message} {...form.register('category')} />
          <SelectField label="Severity" required options={SEVERITIES} error={form.formState.errors.severity?.message} {...form.register('severity')} />
          <TextAreaField label="Description" required rows={3} error={form.formState.errors.description?.message} {...form.register('description')} />
          <button type="submit" className="sr-only">Submit</button>
        </form>
      </Modal>

      <ConfirmationDialog open={Boolean(toggling)} onCancel={() => setToggling(null)} tone={toggling?.enabled ? 'danger' : 'primary'}
        title={toggling?.enabled ? 'Disable this rule?' : 'Enable this rule?'}
        description={toggling ? `"${toggling.name}" will ${toggling.enabled ? 'no longer appear in' : 'appear again in'} compliance views and scores.` : ''}
        confirmLabel={toggling?.enabled ? 'Disable rule' : 'Enable rule'}
        onConfirm={() => { actions.toggleRule(toggling.id); toast.success(toggling.enabled ? 'Rule disabled' : 'Rule enabled', toggling.name); setToggling(null); }} />
    </>
  );
}
