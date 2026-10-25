import { Check, AlertTriangle, X } from 'lucide-react';

const TRACK = ['Submitted', 'Validation', 'Review', 'Decision'];

function position(status) {
  switch (status) {
    case 'Submitted': return 0;
    case 'Validation Pending': return 1;
    case 'Under Review': return 2;
    case 'Documents Required': return 2;
    case 'Approved':
    case 'Rejected': return 3;
    default: return -1;
  }
}

export default function StageTrack({ status }) {
  const pos = position(status);
  const finished = status === 'Approved' || status === 'Rejected';
  return (
    <ol className="flex items-center" aria-label={`Lifecycle stage: ${status}`}>
      {TRACK.map((label, i) => {
        const done = i < pos || (finished && i <= pos);
        const current = i === pos && !finished;
        const warn = current && status === 'Documents Required';
        const rejected = finished && status === 'Rejected' && i === 3;
        return (
          <li key={label} className={`flex items-center ${i < TRACK.length - 1 ? 'flex-1' : ''}`}>
            <span className="flex flex-col items-center gap-1">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  rejected ? 'border-danger bg-danger text-white'
                    : warn ? 'border-warning bg-warning text-white'
                      : done ? 'border-success bg-success text-white'
                        : current ? 'border-accent bg-accent text-white'
                          : 'border-line bg-card text-muted'
                }`}
              >
                {rejected ? <X size={12} /> : warn ? <AlertTriangle size={11} /> : done ? <Check size={12} /> : i + 1}
              </span>
              <span className={`text-[10px] font-semibold ${current || done ? 'text-ink' : 'text-muted'}`}>{label}</span>
            </span>
            {i < TRACK.length - 1 && <span aria-hidden="true" className={`mx-1 mb-4 h-0.5 flex-1 ${i < pos ? 'bg-success' : 'bg-line'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
