import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCheck, CheckCircle2, Eye, FileText, FlaskConical, PlayCircle, Save, Send, XCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { TextAreaField } from '@/components/common/FormField';
import Panel from '@/components/dashboard/Panel';
import WorkflowTimeline from '@/components/applications/WorkflowTimeline';
import StageTrack from '@/components/applications/StageTrack';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { deficiencySchema, rejectionSchema } from '@/utils/schemas';
import { COMPLIANCE_STATUSES, PENDING_STATUSES, REQUIRED_DOCS, SIMULATED_LABEL } from '@/utils/constants';
import { formatDate, formatDateTime, formatFileSize } from '@/utils/format';

export default function ReviewWorkspace() {
  const { id } = useParams();
  const toast = useToast();
  const { scoped, instituteById, documents, actions, role } = useScopedData();
  const app = scoped.applications.find((a) => a.id === id);
  const [notes, setNotes] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [items, setItems] = useState([]);
  const [dialog, setDialog] = useState(null); // 'approve' | 'reject' | 'request'

  useEffect(() => { setNotes(app?.reviewNotes || ''); }, [app?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const defForm = useForm({ resolver: zodResolver(deficiencySchema), defaultValues: { details: '' } });
  const rejForm = useForm({ resolver: zodResolver(rejectionSchema), defaultValues: { reason: '' } });

  if (!app) {
    return <div className="card"><EmptyState title="Application not found" description={`No application "${id}" exists in the review queue.`} action={<Link to="/officer/applications" className="btn btn-primary btn-sm">Back to review queue</Link>} /></div>;
  }

  const inst = instituteById[app.instituteId];
  const docs = documents.filter((d) => d.applicationId === app.id);
  const closed = ['Approved', 'Rejected'].includes(app.status);
  const canStart = ['Submitted', 'Validation Pending'].includes(app.status);
  const canAct = PENDING_STATUSES.includes(app.status);
  const preview = docs.find((d) => d.id === selectedDoc) || null;
  const missingDocs = REQUIRED_DOCS.filter((r) => !docs.some((d) => d.docKey === r.key));
  const unreviewed = docs.filter((d) => !d.reviewed).length;

  const toggleItem = (name) => setItems((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  const checklist = [
    ['All required documents present', missingDocs.length === 0, missingDocs.length ? `Missing: ${missingDocs.map((m) => m.name).join(', ')}` : 'All present'],
    ['Every document reviewed by an officer', unreviewed === 0 && docs.length > 0, unreviewed ? `${unreviewed} not yet reviewed` : 'All reviewed'],
    ['No documents flagged "Missing Information"', !docs.some((d) => d.validationStatus === 'Missing Information'), 'Based on demo validation labels'],
    ['Compliance items assessed', !app.complianceItems.some((c) => c.status === 'Evidence Pending'), 'No item left in Evidence Pending'],
  ];

  const requestDocs = defForm.handleSubmit(() => setDialog('request'));
  const reject = rejForm.handleSubmit(() => setDialog('reject'));

  const confirmRequest = () => {
    const details = defForm.getValues('details').trim();
    actions.requestDocuments(app.id, details, items);
    toast.success('Clarification requested', 'The institute will see the status update. Simulated demo action.');
    defForm.reset();
    setItems([]);
    setDialog(null);
  };
  const confirmApprove = () => {
    actions.decide(app.id, 'Approved', 'Demo approval recorded after simulated review.');
    toast.success('Demo approval recorded', SIMULATED_LABEL);
    setDialog(null);
  };
  const confirmReject = () => {
    actions.decide(app.id, 'Rejected', rejForm.getValues('reason').trim());
    toast.success('Demo rejection recorded', SIMULATED_LABEL);
    rejForm.reset();
    setDialog(null);
  };

  return (
    <>
      <Link to="/officer/applications" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"><ArrowLeft size={14} /> Review queue</Link>
      <PageHeader
        title={app.id}
        description={`${inst?.name} · ${app.applicationType} · ${app.academicYear}`}
        actions={<><StatusBadge status={app.priority} /><StatusBadge status={app.status} />{canStart && <button type="button" className="btn btn-primary" onClick={() => { actions.startReview(app.id); toast.success('Review started', 'Status is now Under Review.'); }}><PlayCircle size={16} /> Start review</button>}</>}
      />
      <div className="mb-6 flex gap-3 rounded-lg border border-warning/30 bg-warning-50 p-3.5 text-xs text-ink">
        <FlaskConical size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
        <p><strong>Simulated workspace.</strong> {SIMULATED_LABEL}{role === 'admin' && ' You are viewing as an admin; actions are logged under your demo account.'}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Panel title="Institute information">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[['Name', inst?.name], ['Institute ID', inst?.id], ['Type', inst?.type], ['Location', inst && `${inst.city}, ${inst.state}`], ['Email', inst?.email], ['Phone', inst?.phone]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-semibold text-muted">{k}</dt><dd className="mt-0.5 break-words text-sm text-ink">{v || '—'}</dd></div>
              ))}
            </dl>
          </Panel>

          <Panel title="Application summary">
            <StageTrack status={app.status} />
            <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[['Category', app.applicationType], ['Academic year', app.academicYear], ['Proposed intake', app.proposedIntake], ['Submitted', formatDate(app.submittedAt)], ['Reviewer', app.assignedReviewer || 'Unassigned'], ['Last updated', formatDateTime(app.updatedAt)]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-semibold text-muted">{k}</dt><dd className="mt-0.5 text-sm text-ink">{v}</dd></div>
              ))}
              <div className="sm:col-span-2"><dt className="text-xs font-semibold text-muted">Program details</dt><dd className="mt-0.5 text-sm text-ink">{app.programDetails}</dd></div>
            </dl>
          </Panel>

          <Panel title="Uploaded documents" subtitle="Select a document to preview. Contents are not stored in this prototype.">
            <ul className="divide-y divide-line">
              {REQUIRED_DOCS.map((req) => {
                const d = docs.find((x) => x.docKey === req.key);
                return (
                  <li key={req.key} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{req.name}</p>
                      <p className="truncate text-xs text-muted">{d ? `${d.fileName} · ${formatFileSize(d.fileSize)}${d.reviewed ? ' · reviewed' : ''}` : 'Not provided'}</p>
                    </div>
                    {d ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={d.validationStatus} size="sm" />
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedDoc(d.id)}><Eye size={13} /> Preview</button>
                        <button type="button" className="btn btn-secondary btn-sm" disabled={d.reviewed || closed} onClick={() => { actions.markDocumentReviewed(d.id); toast.success('Document marked reviewed', d.name); }}><CheckCheck size={13} /> {d.reviewed ? 'Reviewed' : 'Mark reviewed'}</button>
                      </div>
                    ) : <span className="inline-flex items-center rounded-full border border-danger/30 bg-danger-50 px-2 py-0.5 text-[11px] font-semibold text-danger">Missing</span>}
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex min-h-[10rem] flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-soft p-4 text-center">
              <FileText size={28} className="text-muted" aria-hidden="true" />
              {preview ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-ink">{preview.name}</p>
                  <p className="text-xs text-muted">{preview.fileName} · {formatFileSize(preview.fileSize)} · uploaded {formatDate(preview.uploadedAt)}</p>
                  <p className="mt-2 max-w-sm text-xs text-muted">Preview placeholder. Rendering file contents requires backend storage.</p>
                </>
              ) : <p className="mt-2 text-sm text-muted">Select a document above to see its preview area.</p>}
            </div>
          </Panel>

          <Panel title="Validation checklist" subtitle="Demo checks derived from local data. Not official verification.">
            <ul className="space-y-3">
              {checklist.map(([label, ok, detail]) => (
                <li key={label} className="flex gap-2.5">
                  {ok ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success" aria-label="Passed" /> : <XCircle size={17} className="mt-0.5 shrink-0 text-danger" aria-label="Not met" />}
                  <span><span className="block text-sm font-medium text-ink">{label}</span><span className="block text-xs text-muted">{detail}</span></span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Compliance checklist" subtitle="Configurable demonstration rules">
            <ul className="divide-y divide-line">
              {app.complianceItems.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0"><p className="text-sm font-medium text-ink">{c.name}</p><p className="text-xs text-muted">{c.category}</p></div>
                  <label className="flex items-center gap-2">
                    <span className="sr-only">Compliance status for {c.name}</span>
                    <select disabled={closed} value={c.status} onChange={(e) => { actions.updateApplicationCompliance(app.id, c.id, e.target.value); toast.success('Compliance item updated', `${c.name}: ${e.target.value}`); }} className="input w-auto py-1.5 text-xs">
                      {COMPLIANCE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Review notes">
            <TextAreaField label="Internal notes" rows={4} value={notes} disabled={closed} onChange={(e) => setNotes(e.target.value)} hint="Saved to this browser only." />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary" disabled={closed} onClick={() => { actions.saveReviewNotes(app.id, notes); toast.success('Review notes saved', 'Logged in the demo audit trail.'); }}><Save size={16} /> Save Review Notes</button>
              <button type="button" className="btn btn-secondary" disabled={closed || app.reviewComplete || !canAct} onClick={() => { actions.markReviewComplete(app.id); toast.success('Review marked complete', 'You can now record a simulated decision.'); }}><CheckCheck size={16} /> {app.reviewComplete ? 'Review complete' : 'Mark Review Complete'}</button>
            </div>
          </Panel>

          <Panel title="Deficiency feedback" subtitle="Ask the institute for additional documents">
            <form onSubmit={requestDocs} noValidate>
              <fieldset disabled={!canAct}>
                <legend className="label">Affected documents</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {REQUIRED_DOCS.map((r) => (
                    <label key={r.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-ink hover:bg-soft">
                      <input type="checkbox" className="h-4 w-4 rounded border-line" checked={items.includes(r.name)} onChange={() => toggleItem(r.name)} /> {r.name}
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <TextAreaField label="Deficiency details" required rows={3} error={defForm.formState.errors.details?.message} {...defForm.register('details')} />
                </div>
              </fieldset>
              <button type="submit" disabled={!canAct} className="btn btn-primary mt-3"><Send size={16} /> Request Additional Documents</button>
              {!canAct && <p className="hint">Available while the application is submitted or under review.</p>}
            </form>
          </Panel>

          <Panel title="Review decision" subtitle="Simulated demo actions only">
            {closed ? (
              <div className={`rounded-lg border p-3 text-sm ${app.status === 'Approved' ? 'border-success/30 bg-success-50' : 'border-danger/30 bg-danger-50'}`}>
                <p className="font-semibold text-ink">Demo {app.status.toLowerCase()}</p>
                <p className="mt-1 text-ink">{app.decision?.reason}</p>
                <p className="mt-2 text-xs text-muted">{app.decision?.by} · {formatDateTime(app.decision?.at)}. {SIMULATED_LABEL}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-success" disabled={!canAct} onClick={() => setDialog('approve')}><CheckCircle2 size={16} /> Approve in Demo Mode</button>
                </div>
                <form onSubmit={reject} noValidate className="mt-4 border-t border-line pt-4">
                  <TextAreaField label="Rejection reason" required rows={3} disabled={!canAct} error={rejForm.formState.errors.reason?.message} {...rejForm.register('reason')} />
                  <button type="submit" className="btn btn-danger mt-3" disabled={!canAct}><XCircle size={16} /> Reject in Demo Mode</button>
                </form>
                {!canAct && <p className="hint">Decisions are available while the application is submitted or under review.</p>}
              </>
            )}
          </Panel>

          <Panel title="Activity history">
            <WorkflowTimeline events={app.reviewHistory} newestFirst />
          </Panel>
        </div>
      </div>

      <ConfirmationDialog open={dialog === 'approve'} onCancel={() => setDialog(null)} onConfirm={confirmApprove} tone="success" title="Record demo approval?" description={SIMULATED_LABEL} confirmLabel="Record approval">
        {unreviewed > 0 && <p className="text-sm text-warning">{unreviewed} document(s) have not been marked reviewed.</p>}
        <p className="text-sm text-muted">The institute will see "Approved" as a simulated outcome.</p>
      </ConfirmationDialog>
      <ConfirmationDialog open={dialog === 'reject'} onCancel={() => setDialog(null)} onConfirm={confirmReject} tone="danger" title="Record demo rejection?" description={SIMULATED_LABEL} confirmLabel="Record rejection">
        <p className="rounded-lg bg-soft p-3 text-sm text-ink">{rejForm.getValues('reason')}</p>
      </ConfirmationDialog>
      <ConfirmationDialog open={dialog === 'request'} onCancel={() => setDialog(null)} onConfirm={confirmRequest} title="Request additional documents?" description="The status changes to Documents Required and the institute is notified in-app." confirmLabel="Send request">
        <p className="rounded-lg bg-soft p-3 text-sm text-ink">{defForm.getValues('details')}</p>
        {items.length > 0 && <p className="mt-2 text-xs text-muted">Affected: {items.join(', ')}</p>}
      </ConfirmationDialog>
    </>
  );
}
