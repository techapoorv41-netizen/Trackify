import { AlertOctagon } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger">
        <AlertOctagon size={22} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {onRetry && (
        <button type="button" className="btn btn-secondary mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
