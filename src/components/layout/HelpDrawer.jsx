import Drawer from '@/components/common/Drawer';
import { integrationPlaceholders } from '@/services/apiClient';

const TIPS = [
  ['Switch roles', 'Use the amber "Demo role" button in the top bar to explore the Institute, AICTE Officer and Admin interfaces.'],
  ['Follow one application', 'Submit an application as the Institute, switch to the Officer to request documents or record a demo decision, then switch back to see the updated status.'],
  ['Search anywhere', 'Press Ctrl K (or Cmd K) to search applications, institutes and documents available to your current role.'],
  ['Reset the demo', 'Open Settings and choose "Reset demo data" to restore the original fictional dataset.'],
];

const LIMITS = [
  'All data is fictional and stored only in this browser (LocalStorage).',
  'Sign-in is simulated. No credentials are collected or sent anywhere.',
  'Approvals and rejections are simulated demo actions, not regulatory decisions.',
  'Compliance rules are illustrative and configurable, not current AICTE regulations.',
  'Document checks cover file type, size and required fields only. No OCR or content verification runs.',
  'Email, SMS and scheduled jobs are not connected. Alerts are in-app simulations.',
];

export default function HelpDrawer({ open, onClose }) {
  return (
    <Drawer open={open} onClose={onClose} title="Help and demo guide" subtitle="Trackify prototype demonstration">
      <section>
        <h3 className="text-sm font-semibold text-ink">Exploring the prototype</h3>
        <dl className="mt-3 space-y-3">
          {TIPS.map(([t, d]) => (
            <div key={t} className="rounded-lg border border-line p-3">
              <dt className="text-sm font-semibold text-ink">{t}</dt>
              <dd className="mt-1 text-sm text-muted">{d}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mt-6">
        <h3 className="text-sm font-semibold text-ink">What is simulated</h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
          {LIMITS.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </section>
      <section className="mt-6">
        <h3 className="text-sm font-semibold text-ink">Future backend integrations</h3>
        <ul className="mt-3 space-y-2">
          {Object.values(integrationPlaceholders).map((i) => (
            <li key={i.name} className="flex items-center justify-between gap-3 rounded-lg bg-soft px-3 py-2 text-sm">
              <span className="text-ink">{i.name}</span>
              <span className="shrink-0 text-xs font-semibold text-muted">Not connected</span>
            </li>
          ))}
        </ul>
      </section>
    </Drawer>
  );
}
