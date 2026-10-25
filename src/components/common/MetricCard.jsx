import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICON_TONES = {
  blue: 'bg-accent-50 text-accent',
  green: 'bg-success-50 text-success',
  amber: 'bg-warning-50 text-warning',
  red: 'bg-danger-50 text-danger',
  slate: 'bg-soft text-muted',
};

export default function MetricCard({ label, value, description, icon: Icon, tone = 'blue', trend, to }) {
  const body = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`card flex h-full flex-col p-5 ${to ? 'transition-shadow hover:shadow-pop' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_TONES[tone]}`}>
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        {description && <p className="text-xs text-muted">{description}</p>}
        {trend && <Trend {...trend} />}
      </div>
    </motion.div>
  );
  return to ? <Link to={to} className="block h-full rounded-xl">{body}</Link> : body;
}

function Trend({ direction = 'flat', text }) {
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;
  const cls = direction === 'up' ? 'text-success' : direction === 'down' ? 'text-danger' : 'text-muted';
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={13} aria-hidden="true" />
      {text}
    </span>
  );
}
