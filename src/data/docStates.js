import { REQUIRED_DOCS } from '@/utils/constants';

export const DOC_RULE = { faculty: 'R-001', infra: 'R-004', academic: 'R-007', disclosure: 'R-009', support: 'R-005' };

/** Which required document is missing or flagged for a seeded application. */
export function flaggedIndex(seq) {
  return seq % REQUIRED_DOCS.length;
}

export function docStateFor(status, seq, i) {
  const flagged = flaggedIndex(seq);
  switch (status) {
    case 'Draft':
      return { present: i < 2, validation: 'File Received', reviewed: false };
    case 'Submitted':
    case 'Validation Pending':
      return { present: true, validation: 'File Received', reviewed: false };
    case 'Under Review':
      return { present: true, validation: i === flagged ? 'Review Required' : 'Completeness Check Passed', reviewed: i < 2 && i !== flagged };
    case 'Documents Required':
      if (i === flagged) return { present: false, validation: null, reviewed: false };
      if (i === (flagged + 1) % REQUIRED_DOCS.length) return { present: true, validation: 'Missing Information', reviewed: true };
      return { present: true, validation: 'Completeness Check Passed', reviewed: true };
    case 'Rejected':
      return { present: true, validation: i === flagged ? 'Missing Information' : 'Completeness Check Passed', reviewed: true };
    default:
      return { present: true, validation: 'Completeness Check Passed', reviewed: true };
  }
}
