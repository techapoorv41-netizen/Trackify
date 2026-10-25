import { daysFromNow } from '@/utils/format';

const d = (n) => daysFromNow(-n);

/** Illustrative, configurable demonstration rules. They are not current AICTE regulations. */
export const mockRules = [
  { id: 'R-001', name: 'Faculty roster submitted', category: 'Faculty', description: 'A current faculty roster with designation and qualification fields is on record for the academic year.', severity: 'High', enabled: true, updatedAt: d(40) },
  { id: 'R-002', name: 'Faculty-student ratio declaration', category: 'Faculty', description: 'The institute has declared its faculty-student ratio. Any numeric threshold is a configurable demonstration value.', severity: 'High', enabled: true, updatedAt: d(33) },
  { id: 'R-003', name: 'Faculty qualification records', category: 'Faculty', description: 'Qualification evidence is attached for each listed faculty member.', severity: 'Medium', enabled: true, updatedAt: d(52) },
  { id: 'R-004', name: 'Laboratory facilities summary', category: 'Infrastructure', description: 'A laboratory and equipment summary is attached for each program.', severity: 'Medium', enabled: true, updatedAt: d(27) },
  { id: 'R-005', name: 'Campus and building documentation', category: 'Infrastructure', description: 'Supporting documentation describing campus buildings and facilities is attached.', severity: 'Medium', enabled: true, updatedAt: d(61) },
  { id: 'R-006', name: 'Library and learning resources list', category: 'Infrastructure', description: 'A list of library and learning resources is attached.', severity: 'Low', enabled: true, updatedAt: d(75) },
  { id: 'R-007', name: 'Approved intake declaration', category: 'Approved Intake', description: 'The institute has declared the intake for each program in the application.', severity: 'High', enabled: true, updatedAt: d(18) },
  { id: 'R-008', name: 'Program-wise intake breakdown', category: 'Approved Intake', description: 'Intake is broken down by program and academic year.', severity: 'Medium', enabled: true, updatedAt: d(45) },
  { id: 'R-009', name: 'Mandatory disclosure statement published', category: 'Mandatory Disclosures', description: 'A mandatory disclosure statement for the academic year has been submitted.', severity: 'High', enabled: true, updatedAt: d(12) },
  { id: 'R-010', name: 'Annual financial disclosure summary', category: 'Mandatory Disclosures', description: 'A summary of annual financial disclosures is attached.', severity: 'Medium', enabled: true, updatedAt: d(66) },
  { id: 'R-011', name: 'Grievance redressal contact listed', category: 'Mandatory Disclosures', description: 'A grievance redressal contact is listed in the disclosure statement.', severity: 'Low', enabled: true, updatedAt: d(90) },
];

const NEXT_ACTION = {
  Compliant: 'No action needed. Keep evidence current.',
  'Partially Compliant': 'Upload the missing portion of the evidence.',
  'Non-Compliant': 'Submit the required document or declaration.',
  'Evidence Pending': 'Attach evidence for officer review.',
};

export function nextActionFor(status) {
  return NEXT_ACTION[status];
}

export function buildCompliance(institutes, rules) {
  const records = [];
  institutes.forEach((inst, i) => {
    rules.forEach((rule, r) => {
      const n = (i * 7 + r * 3 + (i % 3)) % 10;
      const status = n <= 5 ? 'Compliant' : n <= 7 ? 'Partially Compliant' : n === 8 ? 'Evidence Pending' : 'Non-Compliant';
      records.push({
        id: `CR-${inst.id.split('-')[1]}-${rule.id.split('-')[1]}`,
        instituteId: inst.id,
        ruleId: rule.id,
        category: rule.category,
        requirement: rule.name,
        description: rule.description,
        status,
        academicYear: (i + r) % 5 === 0 ? '2025-26' : '2026-27',
        lastUpdated: d(2 + ((i * 5 + r * 4) % 50)),
        evidence: status === 'Compliant' || status === 'Partially Compliant' ? `${rule.name.split(' ').slice(0, 2).join('_').toLowerCase()}_${inst.id.split('-')[1]}.pdf` : null,
        nextAction: NEXT_ACTION[status],
        note: '',
      });
    });
  });
  return records;
}
