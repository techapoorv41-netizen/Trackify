import { useId, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Trash2, UploadCloud } from 'lucide-react';
import { ALLOWED_EXTENSIONS, MAX_FILE_MB } from '@/utils/constants';
import { formatFileSize } from '@/utils/format';
import { fileMeta, validateFile } from '@/services/applicationService';

/**
 * Local-only uploader. Only file metadata is kept; contents are never read or sent anywhere.
 * `file` is { fileName, fileSize, fileType } or null.
 */
export default function DocumentUploader({ label, hint, file, onSelect, onRemove, required = true, compact = false }) {
  const id = useId();
  const input = useRef(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handle = (f) => {
    if (!f) return;
    const result = validateFile(f);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    onSelect(fileMeta(f));
  };

  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            {label}
            {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
          </p>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
        {file ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success"><CheckCircle2 size={12} /> Selected locally</span>
        ) : required ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-semibold text-warning"><AlertCircle size={12} /> Missing</span>
        ) : null}
      </div>

      {file ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-soft px-3 py-2.5">
          <FileText size={18} className="shrink-0 text-accent" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{file.fileName}</p>
            <p className="text-xs text-muted">{formatFileSize(file.fileSize)} · .{file.fileType} · not verified</p>
          </div>
          {onRemove && (
            <button type="button" onClick={onRemove} aria-label={`Remove ${file.fileName}`} className="rounded-lg p-1.5 text-muted hover:bg-danger-50 hover:text-danger">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files?.[0]); }}
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors ${compact ? 'px-3 py-4' : 'px-4 py-6'} ${
            dragging ? 'border-accent bg-accent-50' : 'border-line hover:border-accent/60 hover:bg-soft'
          }`}
        >
          <UploadCloud size={20} className="text-muted" aria-hidden="true" />
          <span className="mt-1.5 text-sm font-medium text-ink">Choose a file or drag it here</span>
          <span className="mt-0.5 text-xs text-muted">{ALLOWED_EXTENSIONS.join(', ')} · up to {MAX_FILE_MB} MB</span>
        </label>
      )}
      <input
        id={id}
        ref={input}
        type="file"
        className="sr-only"
        accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')}
        onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ''; }}
      />
      {error && <p role="alert" className="field-error">{error}</p>}
    </div>
  );
}
