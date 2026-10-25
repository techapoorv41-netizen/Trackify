import { genId } from '@/utils/format';

export const AUDIT_ACTIONS = [
  'Application Submitted',
  'Draft Saved',
  'Draft Discarded',
  'Document Added',
  'Document Removed',
  'Document Reviewed',
  'Review Started',
  'Review Notes Saved',
  'Clarification Requested',
  'Clarification Submitted',
  'Review Marked Complete',
  'Demo Approval Recorded',
  'Demo Rejection Recorded',
  'Compliance Updated',
  'Demo Rule Updated',
  'Demo User Modified',
  'Demo Institute Modified',
  'Workflow Updated',
  'Alert Created',
  'Alert Sent (Simulated)',
  'Reminder Updated',
  'Demo Data Reset',
];

export function createAuditEvent({ actor, role, action, entityType, entityId, description, timestamp }) {
  return {
    id: genId('AUD'),
    timestamp: timestamp || new Date().toISOString(),
    actor: actor || 'System',
    role: role || 'system',
    action,
    entityType,
    entityId: entityId || '—',
    description,
  };
}
