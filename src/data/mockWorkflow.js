import { daysFromNow, hoursAgo, addDays } from '@/utils/format';
import { PENDING_STATUSES } from '@/utils/constants';

export const defaultWorkflow = {
  stages: [
    { id: 'submission', label: 'Application Submission', description: 'The institute completes the application wizard and submits it with the required documents.', optional: false, enabled: true, slaDays: 3 },
    { id: 'validation', label: 'Automated Validation', description: 'Client-side demo checks for file type, size and required fields. OCR and server-side verification are future backend capabilities.', optional: true, enabled: true, slaDays: 1 },
    { id: 'scrutiny', label: 'Officer Scrutiny', description: 'An officer reviews documents and compliance items and records simulated outcomes.', optional: false, enabled: true, slaDays: 14 },
    { id: 'clarification', label: 'Clarification (if required)', description: 'The officer requests additional documents and the institute responds.', optional: true, enabled: true, slaDays: 7 },
    { id: 'decision', label: 'Final Decision', description: 'A simulated approval or rejection is recorded with a reason. No official decision is made.', optional: false, enabled: true, slaDays: 5 },
  ],
  reminders: { enabled: true, defaultFrequency: 'Every 3 days', leadDays: 3, escalateOverdue: true },
};

const al = (id, title, category, recipientRole, applicationId, priority, scheduledDays, deliveryStatus) => ({
  id, title, category, recipientRole, applicationId, priority, scheduledDate: daysFromNow(scheduledDays), deliveryStatus,
});

export const mockAlerts = [
  al('ALR-001', 'Respond to document request', 'Missing Documents', 'institute', 'TRK-2026-0002', 'High', 1, 'Scheduled'),
  al('ALR-002', 'Review due soon', 'Pending Review', 'officer', 'TRK-2026-0001', 'High', 0, 'Scheduled'),
  al('ALR-003', 'Overdue review escalation', 'Pending Review', 'officer', 'TRK-2026-0011', 'High', -1, 'Sent in-app (simulated)'),
  al('ALR-004', 'Mandatory disclosure update window', 'Application Deadline', 'institute', '', 'Medium', 4, 'Scheduled'),
  al('ALR-005', 'Application status changed', 'Status Update', 'institute', 'TRK-2026-0003', 'Low', -44, 'Sent in-app (simulated)'),
  al('ALR-006', 'Open compliance items summary', 'Compliance Issue', 'admin', '', 'Medium', 2, 'Draft'),
  al('ALR-007', 'Clarification response pending', 'Missing Documents', 'institute', 'TRK-2026-0009', 'Medium', 2, 'Scheduled'),
  al('ALR-008', 'Quarterly rule review reminder', 'Compliance Issue', 'admin', '', 'Low', 14, 'Draft'),
];

export function buildDeadlines(applications, workflow) {
  const scrutinySla = workflow.stages.find((s) => s.id === 'scrutiny').slaDays;
  const clarificationSla = workflow.stages.find((s) => s.id === 'clarification').slaDays;
  const list = [];

  applications.forEach((app) => {
    if (PENDING_STATUSES.includes(app.status)) {
      list.push({
        id: `DL-${app.id}-review`,
        title: `Complete scrutiny of ${app.id}`,
        applicationId: app.id,
        instituteId: app.instituteId,
        dueDate: addDays(app.submittedAt, scrutinySla),
        priority: app.priority,
        audience: 'officer',
        recipientRole: 'officer',
        reminderFrequency: 'Every 3 days',
        reminderStatus: 'Active',
        completed: false,
        type: 'review',
      });
    }
    if (app.status === 'Documents Required' && app.deficiency) {
      list.push({
        id: `DL-${app.id}-response`,
        title: `Respond to document request on ${app.id}`,
        applicationId: app.id,
        instituteId: app.instituteId,
        dueDate: addDays(app.deficiency.requestedAt, clarificationSla),
        priority: app.priority,
        audience: 'institute',
        recipientRole: 'institute',
        reminderFrequency: 'Daily',
        reminderStatus: 'Active',
        completed: false,
        type: 'response',
      });
    }
  });

  const manual = (id, title, dueDays, priority, audience, instituteId, freq, status) => ({
    id, title, applicationId: null, instituteId, dueDate: daysFromNow(dueDays), priority, audience, recipientRole: audience,
    reminderFrequency: freq, reminderStatus: status, completed: false, type: 'manual',
  });

  list.push(
    manual('DL-M-001', 'Update mandatory disclosure statement', 5, 'Medium', 'institute', 'INS-1001', 'Every 3 days', 'Active'),
    manual('DL-M-002', 'Refresh faculty roster evidence', -2, 'High', 'institute', 'INS-1001', 'Daily', 'Active'),
    manual('DL-M-003', 'Complete draft application TRK-2026-0005', 9, 'Low', 'institute', 'INS-1001', 'Weekly', 'Paused'),
    manual('DL-M-004', 'Upload annual financial disclosure summary', 12, 'Medium', 'institute', 'INS-1002', 'Weekly', 'Active'),
    manual('DL-M-101', 'Weekly review queue sweep', 3, 'Low', 'officer', null, 'Weekly', 'Active'),
    manual('DL-M-201', 'Quarterly demo rule review', 14, 'Medium', 'admin', null, 'Once', 'Active'),
    manual('DL-M-202', 'Export demo audit log', 7, 'Low', 'admin', null, 'Weekly', 'Active'),
    manual('DL-M-203', 'Review inactive demo accounts', -3, 'Low', 'admin', null, 'Once', 'Paused'),
  );
  return list;
}

const a = (id, hrs, actor, role, action, entityType, entityId, description) => ({
  id, timestamp: hoursAgo(hrs), actor, role, action, entityType, entityId, description,
});

export const mockAudit = [
  a('AUD-001', 1.5, 'Dr. Sanjay Kulkarni', 'officer', 'Review Notes Saved', 'Application', 'TRK-2026-0001', 'Saved review notes (demo).'),
  a('AUD-002', 6, 'Arjun Mehta', 'officer', 'Document Reviewed', 'Document', 'DOC-0011-1', 'Marked Faculty Roster as reviewed.'),
  a('AUD-003', 18, 'Rahul Verma', 'institute', 'Application Submitted', 'Application', 'TRK-2026-0006', 'Submitted application TRK-2026-0006 (demo).'),
  a('AUD-004', 20, 'Rahul Verma', 'institute', 'Document Added', 'Document', 'DOC-0006-3', 'Added Course & Intake Details to TRK-2026-0006.'),
  a('AUD-005', 30, 'Meera Iyer', 'institute', 'Application Submitted', 'Application', 'TRK-2026-0008', 'Submitted application TRK-2026-0008 (demo).'),
  a('AUD-006', 48, 'Kavita Rao', 'admin', 'Alert Sent (Simulated)', 'Alert', 'ALR-003', 'Marked alert as sent in-app (simulated).'),
  a('AUD-007', 52, 'Kavita Rao', 'admin', 'Demo Rule Updated', 'Rule', 'R-009', 'Edited rule "Mandatory disclosure statement published".'),
  a('AUD-008', 70, 'Dr. Sanjay Kulkarni', 'officer', 'Clarification Requested', 'Application', 'TRK-2026-0002', 'Requested corrected documents (demo).'),
  a('AUD-009', 96, 'Rahul Verma', 'institute', 'Draft Saved', 'Application', 'TRK-2026-0005', 'Saved draft application.'),
  a('AUD-010', 120, 'Arjun Mehta', 'officer', 'Clarification Requested', 'Application', 'TRK-2026-0009', 'Requested additional documents (demo).'),
  a('AUD-011', 150, 'Imran Sheikh', 'admin', 'Demo User Modified', 'User', 'U-004', 'Deactivated demo user Lakshmi Menon.'),
  a('AUD-012', 220, 'Priya Nair', 'officer', 'Review Marked Complete', 'Application', 'TRK-2026-0016', 'Marked review complete.'),
  a('AUD-013', 230, 'Priya Nair', 'officer', 'Demo Approval Recorded', 'Application', 'TRK-2026-0016', 'Demo approval recorded. Simulated outcome only.'),
  a('AUD-014', 300, 'Imran Sheikh', 'admin', 'Workflow Updated', 'Workflow', 'scrutiny', 'Adjusted the Officer Scrutiny demo SLA.'),
  a('AUD-015', 410, 'Dr. Sanjay Kulkarni', 'officer', 'Demo Rejection Recorded', 'Application', 'TRK-2026-0015', 'Demo rejection recorded. Simulated outcome only.'),
  a('AUD-016', 520, 'Kavita Rao', 'admin', 'Demo Institute Modified', 'Institute', 'INS-1009', 'Updated demo institute contact details.'),
  a('AUD-017', 760, 'Priya Nair', 'officer', 'Demo Approval Recorded', 'Application', 'TRK-2026-0003', 'Demo approval recorded. Simulated outcome only.'),
  a('AUD-018', 900, 'Rahul Verma', 'institute', 'Document Added', 'Document', 'DOC-0003-2', 'Added Infrastructure Summary to TRK-2026-0003.'),
];
