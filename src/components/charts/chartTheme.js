import { STATUSES } from '@/utils/constants';

export const STATUS_COLORS = {
  Draft: '#94A3B8',
  Submitted: '#60A5FA',
  'Validation Pending': '#3B82F6',
  'Under Review': '#245B91',
  'Documents Required': '#D97706',
  Approved: '#16A34A',
  Rejected: '#DC2626',
};

export const COMPLIANCE_COLORS = {
  Compliant: '#16A34A',
  'Partially Compliant': '#D97706',
  'Non-Compliant': '#DC2626',
  'Evidence Pending': '#94A3B8',
};

export const SERIES = ['#245B91', '#3B82F6', '#16A34A', '#D97706', '#DC2626', '#64748B'];

export function statusDistribution(applications) {
  return STATUSES.map((s) => ({ name: s, value: applications.filter((a) => a.status === s).length })).filter((d) => d.value > 0);
}
