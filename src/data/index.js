import { mockUsers } from '@/data/mockUsers';
import { mockInstitutes } from '@/data/mockInstitutes';
import { mockRules, buildCompliance } from '@/data/mockCompliance';
import { buildApplications } from '@/data/mockApplications';
import { buildDocuments } from '@/data/mockDocuments';
import { mockNotifications } from '@/data/mockNotifications';
import { defaultWorkflow, mockAlerts, buildDeadlines, mockAudit } from '@/data/mockWorkflow';

export const SLICES = [
  'users', 'institutes', 'applications', 'documents', 'notifications', 'audit',
  'rules', 'alerts', 'compliance', 'deadlines', 'workflow',
];

export function buildSeed() {
  const applications = buildApplications(mockRules);
  return {
    users: mockUsers,
    institutes: mockInstitutes,
    applications,
    documents: buildDocuments(applications),
    notifications: mockNotifications,
    audit: mockAudit,
    rules: mockRules,
    alerts: mockAlerts,
    compliance: buildCompliance(mockInstitutes, mockRules),
    deadlines: buildDeadlines(applications, defaultWorkflow),
    workflow: defaultWorkflow,
  };
}
