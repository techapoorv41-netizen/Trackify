import { todayLong } from '@/utils/format';

export default function PageHeader({ title, description, eyebrow, actions, showDate = false }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {(eyebrow || showDate) && (
          <p className="mb-1 text-xs font-medium text-muted">
            {eyebrow}
            {eyebrow && showDate && <span className="mx-1.5">·</span>}
            {showDate && todayLong()}
          </p>
        )}
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
