import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Info, Pencil, Save, Send, XCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ApplicationStepper from '@/components/applications/ApplicationStepper';
import DocumentUploader from '@/components/documents/DocumentUploader';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { SelectField, TextAreaField, TextField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { detailsStepSchema, instituteStepSchema } from '@/utils/schemas';
import { ACADEMIC_YEARS, APPLICATION_CATEGORIES, INDIAN_STATES, INSTITUTION_TYPES, REQUIRED_DOCS } from '@/utils/constants';
import { localChecks } from '@/services/applicationService';
import { formatFileSize } from '@/utils/format';

const STEPS = [
  { label: 'Institute', caption: 'Basic information' },
  { label: 'Details', caption: 'Application details' },
  { label: 'Documents', caption: 'Upload files' },
  { label: 'Review', caption: 'Check and submit' },
];

export default function NewApplication() {
  const { institute, scoped, documents, actions } = useScopedData();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const draftParam = params.get('draft');

  const draft = useMemo(() => scoped.applications.find((a) => a.id === draftParam && a.status === 'Draft') || null, [scoped.applications, draftParam]);
  const [draftId, setDraftId] = useState(draft?.id || null);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [form, setForm] = useState(() => ({
    instituteName: institute?.name || '', instituteId: institute?.id || '', institutionType: institute?.type || '', state: institute?.state || '',
    city: institute?.city || '', contactEmail: institute?.email || '', contactPhone: institute?.phone || '',
    applicationCategory: draft?.applicationType || '', academicYear: draft?.academicYear || '', proposedIntake: draft?.proposedIntake || '', programDetails: draft?.programDetails || '',
  }));
  const [files, setFiles] = useState(() => {
    if (!draft) return {};
    const out = {};
    documents.filter((d) => d.applicationId === draft.id).forEach((d) => { out[d.docKey] = { fileName: d.fileName, fileSize: d.fileSize, fileType: d.fileType }; });
    return out;
  });
  const [confirm, setConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (draftParam && !draft) toast.warning('Draft not found', 'That draft no longer exists, so a new application was opened.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const f1 = useForm({ resolver: zodResolver(instituteStepSchema), defaultValues: form, mode: 'onTouched' });
  const f2 = useForm({ resolver: zodResolver(detailsStepSchema), defaultValues: form, mode: 'onTouched' });

  const checks = localChecks(form, files);
  const allPassed = checks.every((c) => c.passed);
  const missing = REQUIRED_DOCS.filter((d) => !files[d.key]);

  const go = (n) => { setStep(n); setMaxStep((m) => Math.max(m, n)); };
  const next1 = f1.handleSubmit((v) => { setForm((s) => ({ ...s, ...v })); go(1); });
  const next2 = f2.handleSubmit((v) => { setForm((s) => ({ ...s, ...v })); go(2); });

  const stepClick = (i) => {
    if (i === step) return;
    if (step === 0) f1.handleSubmit((v) => { setForm((s) => ({ ...s, ...v })); setStep(i); })();
    else if (step === 1) f2.handleSubmit((v) => { setForm((s) => ({ ...s, ...v })); setStep(i); })();
    else setStep(i);
  };

  const currentValues = () => ({ ...form, ...(step === 0 ? f1.getValues() : step === 1 ? f2.getValues() : {}) });

  const saveDraft = () => {
    const values = currentValues();
    if (!values.instituteId) { toast.error('Institute ID needed', 'Fill in the Institute ID before saving a draft.'); return; }
    setForm(values);
    const id = actions.saveDraft({ form: values, files, draftId });
    setDraftId(id);
    toast.success('Draft saved', `${id} was saved locally in this browser.`);
  };

  const submit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const id = actions.submitApplication({ form, files, draftId });
      setSubmitting(false);
      setConfirm(false);
      setSubmitted(id);
      toast.success('Application submitted', `${id} was created as a demo submission.`);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-success"><CheckCircle2 size={28} aria-hidden="true" /></span>
          <h1 className="mt-4 text-xl font-bold text-ink">Application submitted</h1>
          <p className="mt-2 text-sm text-muted">Your demo application ID is</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-accent">{submitted}</p>
          <p className="mx-auto mt-4 max-w-md text-xs text-muted">Documents were checked locally for type, size and required fields only. They have not been officially verified, and no regulatory submission has taken place.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={`/institute/applications/${submitted}`} className="btn btn-primary">Track application</Link>
            <Link to="/institute/dashboard" className="btn btn-secondary">Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={draftId ? `Continue draft ${draftId}` : 'New Application'}
        description="Complete the four steps below. Your entries are kept as you move between steps."
        actions={<button type="button" className="btn btn-secondary" onClick={saveDraft}><Save size={16} /> Save Draft</button>}
      />
      <ApplicationStepper steps={STEPS} current={step} maxReached={maxStep} onStepClick={stepClick} />

      <div className="card mt-6 p-5 sm:p-6">
        {step === 0 && (
          <form onSubmit={next1} noValidate>
            <h2 className="text-base font-semibold text-ink">Institute information</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField label="Institute name" required error={f1.formState.errors.instituteName?.message} {...f1.register('instituteName')} />
              <TextField label="Institute ID" required hint="Format: INS-1001" error={f1.formState.errors.instituteId?.message} {...f1.register('instituteId')} />
              <SelectField label="Institution type" required options={INSTITUTION_TYPES} error={f1.formState.errors.institutionType?.message} {...f1.register('institutionType')} />
              <SelectField label="State" required options={INDIAN_STATES} error={f1.formState.errors.state?.message} {...f1.register('state')} />
              <TextField label="City" required error={f1.formState.errors.city?.message} {...f1.register('city')} />
              <TextField label="Contact email" type="email" required error={f1.formState.errors.contactEmail?.message} {...f1.register('contactEmail')} />
              <TextField label="Contact phone" type="tel" required error={f1.formState.errors.contactPhone?.message} {...f1.register('contactPhone')} />
            </div>
            <Nav onNext={next1} />
          </form>
        )}

        {step === 1 && (
          <form onSubmit={next2} noValidate>
            <h2 className="text-base font-semibold text-ink">Application details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <SelectField label="Application category" required options={APPLICATION_CATEGORIES} error={f2.formState.errors.applicationCategory?.message} {...f2.register('applicationCategory')} />
              <SelectField label="Academic year" required options={ACADEMIC_YEARS} error={f2.formState.errors.academicYear?.message} {...f2.register('academicYear')} />
              <TextField label="Proposed intake" type="number" min="1" required hint="Total proposed intake (demo entry)" error={f2.formState.errors.proposedIntake?.message} {...f2.register('proposedIntake')} />
              <div className="sm:col-span-2">
                <TextAreaField label="Course or program details" required rows={4} error={f2.formState.errors.programDetails?.message} {...f2.register('programDetails')} />
              </div>
            </div>
            <Nav onBack={() => { setForm((s) => ({ ...s, ...f2.getValues() })); setStep(0); }} onNext={next2} />
          </form>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-ink">Document upload</h2>
            <div className="mt-3 flex gap-3 rounded-lg border border-accent/25 bg-accent-50 p-3.5 text-xs text-ink">
              <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <p>Only the file name, size and type are recorded locally. Files are not uploaded anywhere, read or verified. OCR and server-side verification are future backend capabilities.</p>
            </div>
            {missing.length > 0 && (
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-warning"><AlertCircle size={16} aria-hidden="true" /> {missing.length} of {REQUIRED_DOCS.length} required documents missing</p>
            )}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {REQUIRED_DOCS.map((d) => (
                <DocumentUploader
                  key={d.key}
                  label={d.name}
                  hint={`${d.category}. ${d.hint}`}
                  file={files[d.key]}
                  onSelect={(meta) => { setFiles((s) => ({ ...s, [d.key]: meta })); toast.success('File selected', `${meta.fileName} (${formatFileSize(meta.fileSize)})`); }}
                  onRemove={() => { setFiles((s) => { const n = { ...s }; delete n[d.key]; return n; }); toast.info('File removed', d.name); }}
                />
              ))}
            </div>
            <Nav onBack={() => setStep(1)} onNext={() => go(3)} nextLabel="Review application" />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-ink">Review and submit</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <Summary title="Institute information" onEdit={() => setStep(0)} rows={[
                  ['Institute', form.instituteName], ['Institute ID', form.instituteId], ['Type', form.institutionType],
                  ['Location', `${form.city}, ${form.state}`], ['Email', form.contactEmail], ['Phone', form.contactPhone],
                ]} />
                <Summary title="Application details" onEdit={() => setStep(1)} rows={[
                  ['Category', form.applicationCategory], ['Academic year', form.academicYear], ['Proposed intake', form.proposedIntake], ['Program details', form.programDetails],
                ]} />
                <section className="rounded-xl border border-line p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Documents</h3>
                    <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"><Pencil size={12} /> Edit</button>
                  </div>
                  <ul className="divide-y divide-line">
                    {REQUIRED_DOCS.map((d) => (
                      <li key={d.key} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="text-ink">{d.name}</span>
                        {files[d.key] ? <span className="truncate text-xs text-muted">{files[d.key].fileName}</span> : <span className="text-xs font-semibold text-danger">Missing</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <aside className="h-fit rounded-xl border border-line p-4">
                <h3 className="text-sm font-semibold text-ink">Validation checklist</h3>
                <p className="mt-0.5 text-xs text-muted">Local demo checks only. Not an official verification.</p>
                <ul className="mt-3 space-y-3">
                  {checks.map((c) => (
                    <li key={c.id} className="flex gap-2.5">
                      {c.passed ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success" aria-label="Passed" /> : <XCircle size={17} className="mt-0.5 shrink-0 text-danger" aria-label="Failed" />}
                      <span><span className="block text-sm font-medium text-ink">{c.label}</span><span className="block text-xs text-muted">{c.detail}</span></span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</button>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-secondary" onClick={saveDraft}><Save size={16} /> Save Draft</button>
                <button type="button" className="btn btn-primary" disabled={!allPassed} onClick={() => setConfirm(true)}><Send size={16} /> Submit Application</button>
              </div>
            </div>
            {!allPassed && <p className="mt-3 text-right text-xs text-danger">Resolve the failed checks above to enable submission.</p>}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={confirm}
        onCancel={() => setConfirm(false)}
        onConfirm={submit}
        loading={submitting}
        title="Submit this application?"
        description="This creates a demo application visible to the officer and admin views. You can still respond to any later document requests."
        confirmLabel="Submit application"
      >
        <p className="text-sm text-muted">This is a prototype. Submission stays in your browser and is not sent to AICTE.</p>
      </ConfirmationDialog>
    </>
  );
}

function Nav({ onBack, onNext, nextLabel = 'Continue' }) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
      {onBack ? <button type="button" className="btn btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button> : <span />}
      <button type="button" className="btn btn-primary" onClick={onNext}>{nextLabel} <ArrowRight size={16} /></button>
    </div>
  );
}

function Summary({ title, rows, onEdit }) {
  return (
    <section className="rounded-xl border border-line p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"><Pencil size={12} /> Edit</button>
      </div>
      <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className={k === 'Program details' ? 'sm:col-span-2' : ''}>
            <dt className="text-xs font-semibold text-muted">{k}</dt>
            <dd className="mt-0.5 text-sm text-ink">{v || <span className="text-danger">Not provided</span>}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
