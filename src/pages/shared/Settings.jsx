import { useState } from 'react';
import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/dashboard/Panel';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { Toggle } from '@/components/common/FormField';
import { usePrefs } from '@/context/PrefsContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { NOTIFICATION_CATEGORIES } from '@/utils/constants';

const THEMES = [['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'System', Monitor]];

export default function Settings() {
  const { prefs, setPref, toggleCategory } = usePrefs();
  const { actions } = useData();
  const toast = useToast();
  const [reset, setReset] = useState(false);

  return (
    <>
      <PageHeader title="Settings" description="Preferences are saved in this browser." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Theme">
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
            {THEMES.map(([value, label, Icon]) => (
              <label key={value} className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-semibold focus-within:ring-2 focus-within:ring-accent/50 ${prefs.theme === value ? 'border-accent bg-accent-50 text-accent' : 'border-line text-muted hover:bg-soft'}`}>
                <input type="radio" name="theme" className="sr-only" checked={prefs.theme === value} onChange={() => setPref('theme', value)} />
                <Icon size={18} aria-hidden="true" />{label}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Light is the default.</p>
        </Panel>

        <Panel title="Display preferences">
          <div className="space-y-5">
            <Toggle checked={prefs.sidebarCollapsed} onChange={(v) => setPref('sidebarCollapsed', v)} label="Collapse sidebar by default" description="Also changes when you use the collapse button." />
            <Toggle checked={prefs.reduceMotion} onChange={(v) => setPref('reduceMotion', v)} label="Reduce motion" description="Turns off most animations." />
            <label className="block">
              <span className="label">Rows per page in tables</span>
              <select className="input w-40" value={prefs.rowsPerPage} onChange={(e) => setPref('rowsPerPage', Number(e.target.value))}>
                {[5, 8, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </Panel>

        <Panel title="Notification preferences" subtitle="Muted categories are hidden from your notification list">
          <div className="space-y-4">
            {NOTIFICATION_CATEGORIES.map((c) => (
              <Toggle key={c} checked={!prefs.mutedCategories.includes(c)} onChange={() => toggleCategory(c)} label={c} />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">In-app only. Email and SMS are not connected in this prototype.</p>
        </Panel>

        <Panel title="Demo data">
          <p className="text-sm text-muted">All data lives in this browser's LocalStorage. Resetting restores the original fictional dataset and removes anything you created.</p>
          <button type="button" className="btn btn-danger mt-4" onClick={() => setReset(true)}><RotateCcw size={16} /> Reset demo data</button>
        </Panel>
      </div>
      <ConfirmationDialog open={reset} onCancel={() => setReset(false)} tone="danger" title="Reset all demo data?" description="Applications, documents, notifications, rules and audit history return to their original demo values. Your role and theme are kept." confirmLabel="Reset demo data"
        onConfirm={() => { actions.resetDemoData(); setReset(false); toast.success('Demo data reset', 'The original fictional dataset was restored.'); }} />
    </>
  );
}
