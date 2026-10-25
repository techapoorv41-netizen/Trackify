import { ALLOWED_EXTENSIONS, MAX_FILE_MB, PENDING_STATUSES, REQUIRED_DOCS, STATUS_STAGE } from '@/utils/constants';
import { addDays, daysUntil } from '@/utils/format';
import { DOC_RULE } from '@/data/docStates';

export function stageFromStatus(status) {
  return STATUS_STAGE[status] || 'created';
}

export function nextApplicationId(applications) {
  const year = new Date().getFullYear();
  const max = applications.reduce((m, a) => {
    const n = parseInt(String(a.id).split('-')[2], 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `TRK-${year}-${String(max + 1).padStart(4, '0')}`;
}

export function extensionOf(fileName = '') {
  const i = fileName.lastIndexOf('.');
  return i === -1 ? '' : fileName.slice(i + 1).toLowerCase();
}

export function validateFile(file) {
  if (!file) return { ok: false, error: 'No file selected.' };
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: `".${ext || 'unknown'}" files are not accepted. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}.` };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return { ok: false, error: `File is larger than the ${MAX_FILE_MB} MB demo limit.` };
  }
  if (file.size === 0) return { ok: false, error: 'The selected file is empty.' };
  return { ok: true };
}

export function fileMeta(file) {
  return { fileName: file.name, fileSize: file.size, fileType: extensionOf(file.name) };
}

/** Client-side demo checks only. Not an official verification. */
export function localChecks(form, files) {
  const hasForm = (k) => form && String(form[k] ?? '').trim() !== '';
  const requiredFields = ['instituteName', 'instituteId', 'institutionType', 'state', 'city', 'contactEmail', 'contactPhone',
    'applicationCategory', 'academicYear', 'proposedIntake', 'programDetails'];
  const missingFields = requiredFields.filter((k) => !hasForm(k));
  const missingDocs = REQUIRED_DOCS.filter((d) => !files[d.key]);
  return [
    { id: 'fields', label: 'Required form fields completed', passed: missingFields.length === 0, detail: missingFields.length ? `${missingFields.length} field(s) missing` : 'All fields present' },
    { id: 'docs', label: 'All required documents attached', passed: missingDocs.length === 0, detail: missingDocs.length ? `Missing: ${missingDocs.map((d) => d.name).join(', ')}` : `${REQUIRED_DOCS.length} of ${REQUIRED_DOCS.length} attached` },
    { id: 'types', label: 'File types accepted', passed: Object.values(files).every((f) => ALLOWED_EXTENSIONS.includes(f.fileType)), detail: 'Checked by file extension only' },
    { id: 'sizes', label: `File sizes within ${MAX_FILE_MB} MB`, passed: Object.values(files).every((f) => f.fileSize <= MAX_FILE_MB * 1024 * 1024), detail: 'Checked locally in the browser' },
  ];
}

export function initialComplianceItems(appId, rules) {
  const byId = Object.fromEntries(rules.map((r) => [r.id, r]));
  const ruleIds = [...REQUIRED_DOCS.map((d) => DOC_RULE[d.key]), 'R-002'];
  return ruleIds
    .filter((id) => byId[id])
    .map((id, i) => ({
      id: `CI-${appId}-${i}`,
      ruleId: id,
      name: byId[id].name,
      category: byId[id].category,
      status: 'Evidence Pending',
      note: '',
    }));
}

export function reviewDueDate(application, workflow) {
  const sla = workflow?.stages?.find((s) => s.id === 'scrutiny')?.slaDays ?? 14;
  return addDays(application.submittedAt, sla);
}

/** Demo-only queue classification, not a regulatory assessment. */
export function queueState(application, workflow) {
  if (!application.submittedAt) return 'Draft';
  if (application.status === 'Documents Required') return 'Awaiting Institute';
  if (!PENDING_STATUSES.includes(application.status)) return 'Closed';
  if (daysUntil(reviewDueDate(application, workflow)) < 0) return 'Overdue';
  if (application.status === 'Under Review') return 'In Progress';
  return 'New';
}

export function buildTimeline(application) {
  return [...(application.reviewHistory || [])].sort((a, b) => new Date(a.at) - new Date(b.at));
}

export function missingRequiredDocs(documents) {
  return REQUIRED_DOCS.filter((req) => !documents.some((d) => d.docKey === req.key));
}
