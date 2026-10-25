import { Check } from 'lucide-react';

export default function ApplicationStepper({ steps, current, onStepClick, maxReached = current }) {
  return (
    <nav aria-label="Application steps" className="card p-4 sm:p-5">
      <ol className="flex items-start">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxReached;
          return (
            <li key={step.label} className={`flex items-start ${i < steps.length - 1 ? 'flex-1' : ''}`}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onStepClick?.(i)}
                aria-current={active ? 'step' : undefined}
                className="group flex flex-col items-center gap-2 text-center disabled:cursor-not-allowed sm:flex-row sm:text-left"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    done ? 'border-success bg-success text-white' : active ? 'border-accent bg-accent text-white' : 'border-line bg-card text-muted'
                  }`}
                >
                  {done ? <Check size={16} aria-label="Completed" /> : i + 1}
                </span>
                <span className="hidden sm:block">
                  <span className={`block text-sm font-semibold ${active ? 'text-ink' : 'text-muted'}`}>{step.label}</span>
                  <span className="block text-xs text-muted">{step.caption}</span>
                </span>
                <span className="block max-w-[4.5rem] text-[11px] font-semibold leading-tight text-muted sm:hidden">{step.label}</span>
              </button>
              {i < steps.length - 1 && <span aria-hidden="true" className={`mx-2 mt-[18px] h-0.5 flex-1 sm:mx-4 ${done ? 'bg-success' : 'bg-line'}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
