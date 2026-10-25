import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, FileWarning, MessageSquareReply, Trash2, Upload } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import Modal from '@/components/common/Modal';
import { TextAreaField } from '@/components/common/FormField';
import ProgressBar from '@/components/common/ProgressBar';
import Panel from '@/components/dashboard/Panel';
import WorkflowTimeline from '@/components/applications/WorkflowTimeline';
import StageTrack from '@/components/applications/StageTrack';
import DocumentUploader from '@/components/documents/DocumentUploader';
import { pendingActionFor } from '@/components/applications/ApplicationsTable';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { REQUIRED_DOCS } from '@/utils/constants';
import { formatDate, formatDateTime, formatFileSize } from '@/utils/format';
import { complianceScore } from '@/utils/compliance';

export default function ApplicationDetails() {
  const { id } = useParams();
  const { hash } = useLocation();
  const toast = useToast();
  const { scoped, instituteById, documents, actions } = useScopedData();
  const app = scoped.applications.find((a) => a.id === id);
  const [respond, setRespond] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [removeDoc, setRemoveDoc] = useState(null);

  useEffect(() => {
    if (!app) return;
    if (hash === '#respond' && app.status === 'Documents Required') setRespond(true);
    if (hash === '#feedback') document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, app?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!app) {
    return (
      <div className="card">
        <EmptyState title="Application not found" description={`There is no application "${id}" available to your institute.`} action={<Link to="/institute/applications" className="btn btn-primary btn-sm">Back to applications</Link>} />
      </div>
    );
  }

  const inst = instituteById[app.instituteId];
  const docs = documents.filter((d) => d.applicationId === app.id);
  const missing = REQUIRED_DOCS.filter((r) => !docs.some((d) => d.docKey === r.key));
  const score = complianceScore(app.complianceItems);
  const canRespond = app.status === 'Documents Required';

  const submitResponse = () => {
    if (message.trim().length < 10) { setMessageError('Add a short response (at least 10 characters).'); return; }
    if (missing.length) { setMessageError(`Upload the missing document(s) first: ${missing.map((m) => m.name).join(', ')}.`); return; }
    actions.respondToClarification(app.id, message.trim());
    setRespond(false);
    setMessage('');
    setMessageError('');
    toast.success('Response submitted', 'The application is back under review.');
  };

  return (
    <>
      <Link to="/institute/applications" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"><ArrowLeft size={14} /> All applications</Link>
      <PageHeader
        title={app.id}
        description={`${app.applicationType} · ${app.academicYear}`}
        actions={
          <>
            <StatusBadge status={app.status} />
            {app.status === 'Draft' && <Link to={`/institute/applications/new?draft=${app.id}`} className="btn btn-primary">Continue draft</Link>}
            {canRespond && <button type="button" className="btn btn-primary" onClick={() => setRespond(true)}><MessageSquareReply size={16} /> Respond</button>}
          </>
        }
      />

      {canRespond && app.deficiency && (
        <div id="feedback" className="mb-6 flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning-50 p-5 sm:flex-row sm:items-start">
          <FileWarning size={22} className="shrink-0 text-warning" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-ink">Clarification required</h2>
            <p className="mt-1 text-sm text-ink">{app.deficiency.reason}</p>
            {app.deficiency.items?.length > 0 && <p className="mt-2 text-xs text-muted">Affected: {app.deficiency.items.join(', ')}</p>}
            <p className="mt-1 text-xs text-muted">Requested {formatDateTime(app.deficiency.requestedAt)}{app.deficiency.requestedBy ? ` by ${app.deficiency.requestedBy}` : ''}</p>
          </div>
          <button type="button" className="btn btn-primary shrink-0" onClick={() => setRespond(true)}><Upload size={16} /> Upload and respond</button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Application progress">
            <StageTrack status={app.status} />
            <p className="mt-4 text-sm text-muted"><span className="font-semibold text-ink">Pending action:</span> {pendingActionFor(app)}</p>
          </Panel>

          <Panel title="Application summary">
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                ['Institute', inst?.name], ['Institute ID', app.instituteId], ['Category', app.applicationType], ['Academic year', app.academicYear],
                ['Proposed intake', app.proposedIntake], ['Submitted', app.submittedAt ? formatDate(app.submittedAt) : 'Not submitted'],
                ['Assigned reviewer', app.assignedReviewer || 'Not yet assigned'], ['Last updated', formatDateTime(app.updatedAt)],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-semibold text-muted">{k}</dt><dd className="mt-0.5 text-sm text-ink">{v}</dd></div>
              ))}
              <div className="sm:col-span-2"><dt className="text-xs font-semibold text-muted">Program details</dt><dd className="mt-0.5 text-sm text-ink">{app.programDetails || '—'}</dd></div>
            </dl>
          </Panel>

          <Panel title="Document checklist" subtitle="Local demo status. Not an official verification.">
            <ul className="divide-y divide-line">
              {REQUIRED_DOCS.map((req) => {
                const d = docs.find((x) => x.docKey === req.key);
                return (
                  <li key={req.key} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{req.name}</p>
                      <p className="truncate text-xs text-muted">{d ? `${d.fileName} · ${formatFileSize(d.fileSize)}` : req.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d ? <StatusBadge status={d.validationStatus} size="sm" /> : <span className="inline-flex items-center rounded-full border border-danger/30 bg-danger-50 px-2 py-0.5 text-[11px] font-semibold text-danger">Missing</span>}
                      {d && ['Draft', 'Documents Required'].includes(app.status) && (
                        <button type="button" className="rounded p-1.5 text-muted hover:bg-danger-50 hover:text-danger" aria-label={`Remove ${d.fileName}`} onClick={() => setRemoveDoc(d)}><Trash2 size={15} /></button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Compliance results" subtitle="Illustrative, configurable demo rules">
            <div className="mb-4"><ProgressBar value={score} label="Items satisfied" /></div>
            <ul className="divide-y divide-line">
              {app.complianceItems.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div><p className="text-sm font-medium text-ink">{c.name}</p><p className="text-xs text-muted">{c.category}</p></div>
                  <StatusBadge status={c.status} size="sm" />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Officer feedback">
            {app.decision ? (
              <div className={`rounded-lg border p-3 text-sm ${app.decision.outcome === 'Approved' ? 'border-success/30 bg-success-50' : 'border-danger/30 bg-danger-50'}`}>
                <p className="font-semibold text-ink">Demo decision: {app.decision.outcome}</p>
                <p className="mt-1 text-ink">{app.decision.reason}</p>
                <p className="mt-2 text-xs text-muted">Simulated outcome only. Not an official regulatory decision.</p>
              </div>
            ) : app.deficiency ? (
              <p className="text-sm text-ink">{app.deficiency.reason}</p>
            ) : (
              <p className="text-sm text-muted">No feedback has been recorded yet.</p>
            )}
            {app.deficiency?.response && (
              <div className="mt-3 rounded-lg bg-soft p-3 text-sm"><p className="text-xs font-semibold text-muted">Your response · {formatDateTime(app.deficiency.response.at)}</p><p className="mt-1 text-ink">{app.deficiency.response.message}</p></div>
            )}
          </Panel>

          <Panel title="Activity timeline">
            <WorkflowTimeline events={app.reviewHistory} />
          </Panel>
        </div>
      </div>

      <Modal
        open={respond}
        onClose={() => setRespond(false)}
        title="Respond to document request"
        description="Upload the requested files, then add a short note for the reviewer."
        size="lg"
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setRespond(false)}>Cancel</button><button type="button" className="btn btn-primary" onClick={submitResponse}>Submit response</button></>}
      >
        <div className="space-y-4">
          {app.deficiency && <p className="rounded-lg bg-warning-50 p-3 text-sm text-ink">{app.deficiency.reason}</p>}
          {REQUIRED_DOCS.filter((r) => app.deficiency?.items?.includes(r.name) || missing.some((m) => m.key === r.key)).map((r) => {
            const d = docs.find((x) => x.docKey === r.key);
            return (
              <DocumentUploader
                key={r.key}
                label={r.name}
                hint={r.hint}
                file={d ? { fileName: d.fileName, fileSize: d.fileSize, fileType: d.fileType } : null}
                onSelect={(meta) => { actions.addDocument(app.id, r.key, meta); toast.success('Document added', meta.fileName); setMessageError(''); }}
                onRemove={d ? () => setRemoveDoc(d) : undefined}
              />
            );
          })}
          <TextAreaField label="Message to reviewer" required rows={3} value={message} onChange={(e) => { setMessage(e.target.value); setMessageError(''); }} error={messageError} />
        </div>
      </Modal>

      <ConfirmationDialog
        open={Boolean(removeDoc)}
        onCancel={() => setRemoveDoc(null)}
        onConfirm={() => { actions.removeDocument(removeDoc.id); toast.success('Document removed', removeDoc.fileName); setRemoveDoc(null); }}
        tone="danger"
        title="Remove this document?"
        description={removeDoc ? `${removeDoc.fileName} will be removed from ${app.id}.` : ''}
        confirmLabel="Remove document"
      />
    </>
  );
}
