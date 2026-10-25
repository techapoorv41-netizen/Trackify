import { useMemo, useState } from 'react';
import { Info, Lightbulb, Paperclip } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import Tabs from '@/components/common/Tabs';
import Panel from '@/components/dashboard/Panel';
import ComplianceCard from '@/components/compliance/ComplianceCard';
import Modal from '@/components/common/Modal';
import DocumentUploader from '@/components/documents/DocumentUploader';
import MetricCard from '@/components/common/MetricCard';
import { ShieldAlert, ShieldCheck, FileQuestion } from 'lucide-react';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { COMPLIANCE_CATEGORIES } from '@/utils/constants';
import { complianceScore, isOpenIssue } from '@/utils/compliance';

export default function InstituteCompliance() {
  const { scoped, actions } = useScopedData();
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [evidenceFor, setEvidenceFor] = useState(null);

  const records = scoped.compliance;
  const overall = complianceScore(records);
  const missingEvidence = records.filter((r) => !r.evidence && r.status !== 'Compliant');
  const open = records.filter(isOpenIssue);

  const tabs = [{ value: 'all', label: 'All', count: records.length }, ...COMPLIANCE_CATEGORIES.map((c) => ({ value: c, label: c, count: records.filter((r) => r.category === c).length }))];
  const visible = useMemo(() => (tab === 'all' ? records : records.filter((r) => r.category === tab)), [records, tab]);
  const recommended = useMemo(() => records.filter((r) => r.status !== 'Compliant').sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.severity] - { High: 0, Medium: 1, Low: 2 }[b.severity])).slice(0, 5), [records]);

  return (
    <>
      <PageHeader title="Compliance" description="Track your institute against configurable demonstration rules and attach supporting evidence." />
      <div className="mb-6 flex gap-3 rounded-lg border border-warning/30 bg-warning-50 p-3.5 text-xs text-ink">
        <Info size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
        <p><strong>Illustrative rules.</strong> These are configurable demonstration rules, not current AICTE regulations or thresholds. Admins can edit them.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Overall compliance" value={`${overall}%`} description="Partial items count as half" icon={ShieldCheck} tone={overall >= 80 ? 'green' : overall >= 50 ? 'amber' : 'red'} />
        <MetricCard label="Open issues" value={open.length} description="Partially or non-compliant" icon={ShieldAlert} tone={open.length ? 'amber' : 'green'} />
        <MetricCard label="Missing evidence" value={missingEvidence.length} description="Items without a reference file" icon={FileQuestion} tone={missingEvidence.length ? 'red' : 'green'} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Tabs tabs={tabs} value={tab} onChange={setTab} label="Compliance categories" />
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((r) => (
              <ComplianceCard
                key={r.id}
                record={r}
                actions={r.status !== 'Compliant' && <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEvidenceFor(r)}><Paperclip size={13} /> {r.evidence ? 'Replace evidence' : 'Attach evidence'}</button>}
              />
            ))}
            {!visible.length && <p className="text-sm text-muted">No requirements in this category.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <Panel title="By category">
            <div className="space-y-4">
              {COMPLIANCE_CATEGORIES.map((c) => <ProgressBar key={c} label={c} value={complianceScore(records.filter((r) => r.category === c))} />)}
            </div>
          </Panel>
          <Panel title="Recommended actions" subtitle="Highest severity first">
            {recommended.length ? (
              <ul className="space-y-3">
                {recommended.map((r) => (
                  <li key={r.id} className="flex gap-3">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                    <div><p className="text-sm font-medium text-ink">{r.requirement}</p><p className="text-xs text-muted">{r.nextAction}</p><div className="mt-1"><StatusBadge status={r.severity} size="sm" /></div></div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">Everything is compliant against the current demo rules.</p>}
          </Panel>
        </div>
      </div>

      <Modal open={Boolean(evidenceFor)} onClose={() => setEvidenceFor(null)} title="Attach evidence" description={evidenceFor?.requirement}>
        <p className="mb-3 text-xs text-muted">Only the file name is recorded locally. The item moves to "Evidence Pending" until an officer reviews it.</p>
        <DocumentUploader
          label="Evidence file"
          required={false}
          file={null}
          onSelect={(meta) => { actions.attachComplianceEvidence(evidenceFor.id, meta.fileName); toast.success('Evidence attached', 'Awaiting officer review (demo).'); setEvidenceFor(null); }}
        />
      </Modal>
    </>
  );
}
