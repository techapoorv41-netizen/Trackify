import { hoursAgo } from '@/utils/format';

const n = (id, title, message, category, hrs, isRead, relatedEntityId, audience, instituteId = null) => ({
  id, title, message, category, createdAt: hoursAgo(hrs), isRead, relatedEntityId, audience, instituteId,
});

export const mockNotifications = [
  n('NTF-001', 'Additional documents requested', 'The reviewer has asked for corrected files on TRK-2026-0002. Respond before the demo deadline.', 'Document Deficiency', 70, false, 'TRK-2026-0002', 'institute', 'INS-1001'),
  n('NTF-002', 'Application moved to Under Review', 'TRK-2026-0001 is now under officer review.', 'Application Update', 26, false, 'TRK-2026-0001', 'institute', 'INS-1001'),
  n('NTF-003', 'Faculty evidence reminder', 'The faculty roster evidence for your institute is overdue in the demo schedule.', 'Deadline Reminder', 20, false, 'INS-1001', 'institute', 'INS-1001'),
  n('NTF-004', 'Automated validation queued', 'TRK-2026-0006 has been queued for automated demo validation.', 'Application Update', 18, true, 'TRK-2026-0006', 'institute', 'INS-1001'),
  n('NTF-005', 'Demo approval recorded', 'TRK-2026-0003 was approved in demo mode. This is a simulated outcome.', 'Application Update', 24 * 44, true, 'TRK-2026-0003', 'institute', 'INS-1001'),
  n('NTF-006', 'Draft application saved', 'Your draft TRK-2026-0005 is waiting to be completed.', 'System', 96, true, 'TRK-2026-0005', 'institute', 'INS-1001'),
  n('NTF-007', 'Clarification requested for your application', 'Documents are required for TRK-2026-0009.', 'Document Deficiency', 120, false, 'TRK-2026-0009', 'institute', 'INS-1003'),
  n('NTF-101', 'Review overdue in demo schedule', 'TRK-2026-0011 has passed its demo review date.', 'Deadline Reminder', 6, false, 'TRK-2026-0011', 'officer'),
  n('NTF-102', 'New application received', 'TRK-2026-0013 was submitted and is waiting for scrutiny.', 'Application Update', 30, false, 'TRK-2026-0013', 'officer'),
  n('NTF-103', 'Institute responded to clarification', 'A response was recorded on TRK-2026-0007.', 'Application Update', 50, true, 'TRK-2026-0007', 'officer'),
  n('NTF-104', 'Compliance gap flagged', 'Konkan Technical Campus has open demo compliance items.', 'Compliance', 40, false, 'INS-1008', 'officer'),
  n('NTF-201', 'Demo rule updated', 'The rule "Mandatory disclosure statement published" was edited in demo mode.', 'System', 52, false, 'R-009', 'admin'),
  n('NTF-202', 'Simulated alert delivery summary', '3 in-app alerts were marked as sent in the demo scheduler.', 'System', 48, true, null, 'admin'),
  n('NTF-203', 'Inactive demo account', 'A demo institute user account is inactive.', 'System', 100, true, null, 'admin'),
  n('NTF-301', 'Welcome to the Trackify prototype', 'All data here is fictional and stored only in your browser. Use the role switcher to explore each interface.', 'System', 200, false, null, 'all'),
];
