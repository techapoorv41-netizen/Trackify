import { useState } from 'react';
import { ArrowRight, Check, Eye, Pencil, RotateCcw, Save, X } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/dashboard/Panel';
import Modal from '@/components/common/Modal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { Toggle, SelectField, TextAreaField, TextField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { defaultWorkflow } from '@/data/mockWorkflow';
import { REMINDER_FREQUENCIES } from '@/utils/constants';

export default function WorkflowConfig() {
  const { workflow, actions } = useScopedData();
  const toast = useToast();
  const [selected, setSelected] = useState(workflow.stages[0].id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [resetting, setResetting] = useState(false);

  const stage = workflow.stages.find((s) => s.id === selected) || workflow.stages[0];
  const replace = (id, patch) => workflow.stages.map((s) => (s.id === id ? { ...s, ...patch } : s));

  const startEdit = () => { setDraft({ label: stage.label, description: stage.description, slaDays: stage.slaDays }); setError(''); setEditing(true); };
  const saveEdit = () => {
    if (draft.label.trim().length < 3) { setError('Label must be at least 3 characters.'); return; }
    const sla = Number(draft.slaDays);
    if (!Number.isInteger(sla) || sla < 1 || sla > 90) { setError('Target days must be a whole number from 1 to 90.'); return; }
    actions.updateWorkflow({ stages: replace(stage.id, { label: draft.label.trim(), description: draft.description.trim(), slaDays: sla }) }, `Edited workflow stage "${draft.label.trim()}".`);
    toast.success('Stage updated', 'Saved locally. This does not change any real AICTE system.');
    setEditing(false);
  };
  const toggleStage = (enabled) => {
    actions.updateWorkflow({ stages: replace(stage.id, { enabled }) }, `${enabled ? 'Enabled' : 'Disabled'} optional stage "${stage.label}".`);
    toast.success(`${stage.label} ${enabled ? 'enabled' : 'disabled'}`);
  };
  const setReminder = (patch) => actions.updateWorkflow({ reminders: { ...workflow.reminders, ...patch } }, 'Adjusted demo reminder settings.');

  return (
    <>
      <PageHeader title="Workflow Configuration" description="Edit the demo approval workflow. Changes are saved in this browser only." actions={<>
        <button type="button" className="btn btn-secondary" onClick={() => setPreview(true)}><Eye size={16} /> Preview workflow</button>
        <button type="button" className="btn btn-secondary" onClick={() => setResetting(true)}><RotateCcw size={16} /> Restore default</button>
      </>} />
      <p className="mb-5 rounded-lg border border-warning/30 bg-warning-50 p-3.5 text-xs text-ink">These settings only affect this prototype (for example, whether new submissions go through the demo validation stage). They do not alter any real AICTE system.</p>

      <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {workflow.stages.map((s, i) => (
          <li key={s.id} className="flex flex-1 flex-col items-stretch gap-3 lg:flex-row lg:items-center">
            <button type="button" onClick={() => { setSelected(s.id); setEditing(false); }} aria-pressed={s.id === stage.id}
              className={`card flex h-full flex-1 flex-col p-4 text-left transition-colors ${s.id === stage.id ? 'border-accent ring-2 ring-accent/30' : 'hover:bg-soft'} ${s.enabled ? '' : 'opacity-60'}`}>
              <span className="flex items-center justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span>{s.optional && <span className="text-[10px] font-semibold uppercase text-muted">Optional</span>}</span>
              <span className="mt-3 text-sm font-semibold text-ink">{s.label}</span>
              <span className="mt-1 text-xs text-muted">{s.enabled ? `Target ${s.slaDays} day${s.slaDays === 1 ? '' : 's'}` : 'Disabled'}</span>
            </button>
            {i < workflow.stages.length - 1 && <ArrowRight size={18} className="hidden shrink-0 text-muted lg:block" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Stage details" actions={!editing && <button type="button" className="btn btn-secondary btn-sm" onClick={startEdit}><Pencil size={13} /> Edit</button>}>
          {editing ? (
            <div className="space-y-4">
              <TextField label="Stage label" required value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
              <TextAreaField label="Description" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <TextField label="Target days (demo SLA)" type="number" value={draft.slaDays} onChange={(e) => setDraft({ ...draft, slaDays: e.target.value })} hint="Used for overdue calculations in this prototype." />
              {error && <p role="alert" className="field-error">{error}</p>}
              <div className="flex gap-2"><button type="button" className="btn btn-primary" onClick={saveEdit}><Save size={16} /> Save stage</button><button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}><X size={16} /> Cancel</button></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div><p className="text-xs font-semibold text-muted">Label</p><p className="text-sm text-ink">{stage.label}</p></div>
              <div><p className="text-xs font-semibold text-muted">Description</p><p className="text-sm text-ink">{stage.description}</p></div>
              <div><p className="text-xs font-semibold text-muted">Target days</p><p className="text-sm text-ink">{stage.slaDays}</p></div>
              {stage.optional ? <Toggle checked={stage.enabled} onChange={toggleStage} label="Stage enabled" description="Optional stages can be switched off in the demo." /> : <p className="text-xs text-muted">This stage is required and cannot be disabled.</p>}
            </div>
          )}
        </Panel>

        <Panel title="Demo reminder settings" subtitle="Locally simulated. A backend scheduler is needed for real delivery.">
          <div className="space-y-4">
            <Toggle checked={workflow.reminders.enabled} onChange={(v) => setReminder({ enabled: v })} label="Reminders enabled" />
            <SelectField label="Default frequency" options={REMINDER_FREQUENCIES} value={workflow.reminders.defaultFrequency} onChange={(e) => e.target.value && setReminder({ defaultFrequency: e.target.value })} />
            <TextField label="Lead time (days before due)" type="number" min="0" max="30" value={workflow.reminders.leadDays} onChange={(e) => { const n = Math.max(0, Math.min(30, Number(e.target.value) || 0)); setReminder({ leadDays: n }); }} />
            <Toggle checked={workflow.reminders.escalateOverdue} onChange={(v) => setReminder({ escalateOverdue: v })} label="Highlight overdue tasks" description="Shows overdue items prominently on dashboards." />
          </div>
        </Panel>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} title="Workflow preview" description="How an application moves through the enabled stages." size="lg">
        <ol className="space-y-3">
          {workflow.stages.filter((s) => s.enabled).map((s, i) => (
            <li key={s.id} className="flex gap-3 rounded-lg border border-line p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-white"><Check size={14} /></span><div><p className="text-sm font-semibold text-ink">{i + 1}. {s.label}</p><p className="text-xs text-muted">{s.description} · target {s.slaDays}d</p></div></li>
          ))}
        </ol>
      </Modal>
      <ConfirmationDialog open={resetting} onCancel={() => setResetting(false)} title="Restore default workflow?" description="Stage labels, targets and reminder settings return to their original demo values." confirmLabel="Restore default"
        onConfirm={() => { actions.updateWorkflow(defaultWorkflow, 'Restored default workflow.'); toast.success('Default workflow restored'); setResetting(false); setEditing(false); }} />
    </>
  );
}
