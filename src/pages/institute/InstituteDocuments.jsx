import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileText, FilterX, Info, Trash2, Upload } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import FilterDropdown from '@/components/common/FilterDropdown';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import Drawer from '@/components/common/Drawer';
import Modal from '@/components/common/Modal';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import DocumentUploader from '@/components/documents/DocumentUploader';
import { SelectField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { DOC_CATEGORIES, REQUIRED_DOCS, VALIDATION_STATUSES } from '@/utils/constants';
import { formatDate, formatFileSize } from '@/utils/format';

export default function InstituteDocuments() {
  const { scoped, actions } = useScopedData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [validation, setValidation] = useState('');
  const [preview, setPreview] = useState(null);
  const [removeDoc, setRemoveDoc] = useState(null);
  const [upload, setUpload] = useState(false);
  const [target, setTarget] = useState({ appId: '', docKey: '' });

  const editable = scoped.applications.filter((a) => ['Draft', 'Documents Required'].includes(a.status));

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return scoped.documents.filter((d) => {
      if (s && ![d.name, d.fileName, d.applicationId].some((v) => v.toLowerCase().includes(s))) return false;
      if (category && d.category !== category) return false;
      if (validation && d.validationStatus !== validation) return false;
      return true;
    });
  }, [scoped.documents, q, category, validation]);

  const counts = DOC_CATEGORIES.map((c) => [c, scoped.documents.filter((d) => d.category === c).length]);

  const columns = [
    { key: 'category', header: 'Category', sortable: true },
    { key: 'name', header: 'Document', sortable: true, render: (d) => <span><span className="block font-medium">{d.name}</span><span className="block max-w-[14rem] truncate text-xs text-muted">{d.fileName}</span></span> },
    { key: 'applicationId', header: 'Application', sortable: true, render: (d) => <Link to={`/institute/applications/${d.applicationId}`} className="font-semibold text-accent hover:underline">{d.applicationId}</Link> },
    { key: 'uploadedAt', header: 'Uploaded', sortable: true, sortValue: (d) => new Date(d.uploadedAt).getTime(), render: (d) => formatDate(d.uploadedAt) },
    { key: 'validationStatus', header: 'Validation', sortable: true, render: (d) => <StatusBadge status={d.validationStatus} size="sm" /> },
    { key: 'fileType', header: 'Type', sortable: true, render: (d) => <span className="uppercase text-muted">{d.fileType}</span> },
    {
      key: 'actions', header: 'Actions',
      render: (d) => {
        const canRemove = editable.some((a) => a.id === d.applicationId);
        return (
          <div className="flex gap-1.5">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPreview(d)}><Eye size={13} /> Preview</button>
            <button type="button" disabled={!canRemove} title={canRemove ? 'Remove document' : 'Only draft or clarification-stage applications can change documents'} className="btn btn-ghost btn-sm" aria-label={`Remove ${d.fileName}`} onClick={() => setRemoveDoc(d)}><Trash2 size={14} /></button>
          </div>
        );
      },
    },
  ];

  const doUpload = (meta) => {
    if (!target.appId || !target.docKey) { toast.error('Choose where to attach the file', 'Select an application and a document type first.'); return; }
    actions.addDocument(target.appId, target.docKey, meta);
    toast.success('Document added', `${meta.fileName} attached to ${target.appId}. Local checks only.`);
    setUpload(false);
    setTarget({ appId: '', docKey: '' });
  };

  return (
    <>
      <PageHeader
        title="Documents"
        description="Every document attached to your applications, with demo validation results."
        actions={<button type="button" className="btn btn-primary" onClick={() => setUpload(true)} disabled={!editable.length} title={editable.length ? '' : 'No application currently accepts new documents'}><Upload size={16} /> Upload Document</button>}
      />
      <div className="mb-5 flex gap-3 rounded-lg border border-accent/25 bg-accent-50 p-3.5 text-xs text-ink">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        <p>Validation labels are client-side demo checks (file type, size and presence). They are not regulatory verification, and file contents are never read.</p>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {counts.map(([c, n]) => (
          <button key={c} type="button" onClick={() => setCategory(category === c ? '' : c)} className={`card p-3 text-left transition-colors ${category === c ? 'border-accent bg-accent-50' : 'hover:bg-soft'}`}>
            <p className="text-xs font-medium text-muted">{c}</p><p className="mt-1 text-xl font-bold text-ink">{n}</p>
          </button>
        ))}
      </div>
      <div className="card">
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search documents…" label="Search documents" className="md:col-span-2" />
          <FilterDropdown label="Category" value={category} onChange={setCategory} options={DOC_CATEGORIES} />
          <FilterDropdown label="Validation" value={validation} onChange={setValidation} options={VALIDATION_STATUSES} />
        </div>
        <DataTable columns={columns} rows={rows} initialSort={{ key: 'uploadedAt', dir: 'desc' }} caption="Documents"
          empty={scoped.documents.length
            ? <EmptyState icon={FilterX} title="No documents match your filters" action={<button type="button" className="btn btn-secondary btn-sm" onClick={() => { setQ(''); setCategory(''); setValidation(''); }}>Clear filters</button>} />
            : <EmptyState icon={FileText} title="No documents yet" description="Documents appear here once attached to an application." />} />
      </div>

      <Drawer open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.name || ''} subtitle={preview?.fileName}>
        {preview && (
          <div className="space-y-5">
            <div className="flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-soft text-center">
              <FileText size={34} className="text-muted" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink">Preview placeholder</p>
              <p className="mt-1 max-w-xs text-xs text-muted">File contents are not stored or rendered in this prototype. A real preview needs backend file storage.</p>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[['Category', preview.category], ['Application', preview.applicationId], ['Type', preview.fileType.toUpperCase()], ['Size', formatFileSize(preview.fileSize)], ['Uploaded', formatDate(preview.uploadedAt)]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-semibold text-muted">{k}</dt><dd className="mt-0.5 text-ink">{v}</dd></div>
              ))}
              <div><dt className="text-xs font-semibold text-muted">Demo validation</dt><dd className="mt-1"><StatusBadge status={preview.validationStatus} size="sm" /></dd></div>
            </dl>
          </div>
        )}
      </Drawer>

      <Modal open={upload} onClose={() => setUpload(false)} title="Upload a document" description="Choose the application and document type, then select a file." size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Application" required value={target.appId} onChange={(e) => setTarget((t) => ({ ...t, appId: e.target.value }))} options={editable.map((a) => ({ value: a.id, label: `${a.id} (${a.status})` }))} />
            <SelectField label="Document type" required value={target.docKey} onChange={(e) => setTarget((t) => ({ ...t, docKey: e.target.value }))} options={REQUIRED_DOCS.map((d) => ({ value: d.key, label: `${d.name} · ${d.category}` }))} />
          </div>
          <DocumentUploader label="File" hint="Replaces any existing file of the same document type." required={false} file={null} onSelect={doUpload} />
        </div>
      </Modal>

      <ConfirmationDialog
        open={Boolean(removeDoc)}
        onCancel={() => setRemoveDoc(null)}
        onConfirm={() => { actions.removeDocument(removeDoc.id); toast.success('Document removed', removeDoc.fileName); setRemoveDoc(null); }}
        tone="danger" title="Remove this document?" description={removeDoc ? `${removeDoc.fileName} will be removed from ${removeDoc.applicationId}.` : ''} confirmLabel="Remove document"
      />
    </>
  );
}
