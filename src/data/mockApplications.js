import { REQUIRED_DOCS, STATUS_STAGE } from '@/utils/constants';
import { daysFromNow } from '@/utils/format';
import { DOC_RULE, docStateFor, flaggedIndex } from '@/data/docStates';

const ago = (n) => daysFromNow(-Math.max(0, n));

const REVIEWERS = { 'U-101': 'Dr. Sanjay Kulkarni', 'U-102': 'Priya Nair', 'U-103': 'Arjun Mehta' };
const INSTITUTE_CONTACTS = { 'INS-1001': 'Rahul Verma', 'INS-1002': 'Meera Iyer', 'INS-1003': 'Farhan Qureshi', 'INS-1010': 'Lakshmi Menon' };

// seq, institute, category, year, status, priority, submittedDaysAgo, updatedDaysAgo, intake, program, reviewer
const SEEDS = [
  [1, 'INS-1001', 'Extension of Approval', '2026-27', 'Under Review', 'High', 12, 1, 240, 'B.Tech Computer Science & Engineering and Electronics & Communication', 'U-101'],
  [2, 'INS-1001', 'Increase in Intake', '2026-27', 'Documents Required', 'Medium', 20, 3, 60, 'B.Tech Artificial Intelligence & Data Science', 'U-101'],
  [3, 'INS-1001', 'New Course / Program', '2026-27', 'Approved', 'Low', 60, 44, 60, 'M.Tech VLSI Design', 'U-102'],
  [4, 'INS-1001', 'Extension of Approval', '2025-26', 'Rejected', 'Medium', 120, 101, 180, 'B.Tech Mechanical Engineering', 'U-103'],
  [5, 'INS-1001', 'Change of Name / Location', '2026-27', 'Draft', 'Low', null, 4, 0, 'Administrative block relocation within the campus', null],
  [6, 'INS-1001', 'Increase in Intake', '2026-27', 'Validation Pending', 'Medium', 1, 1, 30, 'B.Tech Civil Engineering additional section', null],
  [7, 'INS-1002', 'New Course / Program', '2026-27', 'Under Review', 'High', 9, 2, 60, 'M.Tech Embedded Systems', 'U-102'],
  [8, 'INS-1002', 'Extension of Approval', '2026-27', 'Submitted', 'Medium', 2, 2, 180, 'B.Tech Information Technology', null],
  [9, 'INS-1003', 'New Institution', '2027-28', 'Documents Required', 'High', 25, 5, 120, 'MBA and PGDM programs, new campus proposal', 'U-103'],
  [10, 'INS-1004', 'Extension of Approval', '2026-27', 'Approved', 'Low', 45, 33, 120, 'Diploma Electrical and Mechanical Engineering', 'U-101'],
  [11, 'INS-1005', 'Increase in Intake', '2026-27', 'Under Review', 'High', 15, 4, 90, 'B.Tech Computer Science & Engineering', 'U-103'],
  [12, 'INS-1006', 'New Course / Program', '2026-27', 'Validation Pending', 'Medium', 1, 1, 60, 'B.Pharm Regulatory Sciences stream', null],
  [13, 'INS-1007', 'Extension of Approval', '2026-27', 'Submitted', 'Low', 3, 3, 72, 'M.Sc Applied Physics and Data Analytics', null],
  [14, 'INS-1008', 'Closure of Course', '2026-27', 'Under Review', 'Medium', 7, 2, 0, 'Closure of Diploma Textile Technology', 'U-102'],
  [15, 'INS-1009', 'New Institution', '2027-28', 'Rejected', 'High', 70, 55, 60, 'B.Arch and M.Plan programs', 'U-101'],
  [16, 'INS-1010', 'Extension of Approval', '2026-27', 'Approved', 'Low', 33, 22, 90, 'Diploma Computer Engineering', 'U-102'],
  [17, 'INS-1002', 'Increase in Intake', '2025-26', 'Approved', 'Medium', 150, 138, 60, 'B.Tech Electronics Engineering', 'U-101'],
  [18, 'INS-1005', 'Change of Name / Location', '2026-27', 'Documents Required', 'Medium', 11, 9, 0, 'Change of registered campus address', 'U-102'],
  [19, 'INS-1008', 'Extension of Approval', '2026-27', 'Draft', 'Low', null, 6, 120, 'B.Tech Civil and Mechanical Engineering', null],
  [20, 'INS-1006', 'Increase in Intake', '2026-27', 'Under Review', 'Low', 5, 1, 30, 'B.Pharm additional section', 'U-103'],
];

function ev(at, actor, role, type, text) {
  return { id: `EV-${type}-${new Date(at).getTime()}-${Math.random().toString(36).slice(2, 6)}`, at, actor, role, type, text };
}

function complianceItemsFor(status, seq, rulesById) {
  const items = REQUIRED_DOCS.map((req, i) => {
    const state = docStateFor(status, seq, i);
    let itemStatus = 'Evidence Pending';
    if (['Draft', 'Submitted', 'Validation Pending'].includes(status)) itemStatus = 'Evidence Pending';
    else if (!state.present) itemStatus = 'Non-Compliant';
    else if (state.validation === 'Completeness Check Passed') itemStatus = 'Compliant';
    else if (state.validation === 'Missing Information') itemStatus = 'Partially Compliant';
    const rule = rulesById[DOC_RULE[req.key]];
    return { id: `CI-${seq}-${req.key}`, ruleId: rule.id, name: rule.name, category: rule.category, status: itemStatus, note: '' };
  });
  const ratioRule = rulesById['R-002'];
  const ratioStatus = status === 'Approved' ? 'Compliant' : status === 'Rejected' ? 'Non-Compliant' : status === 'Under Review' ? 'Partially Compliant' : 'Evidence Pending';
  items.push({ id: `CI-${seq}-ratio`, ruleId: ratioRule.id, name: ratioRule.name, category: ratioRule.category, status: ratioStatus, note: '' });
  return items;
}

export function buildApplications(rules) {
  const rulesById = Object.fromEntries(rules.map((r) => [r.id, r]));
  return SEEDS.map(([seq, instituteId, category, year, status, priority, sub, upd, intake, program, reviewerId]) => {
    const id = `TRK-2026-${String(seq).padStart(4, '0')}`;
    const contact = INSTITUTE_CONTACTS[instituteId] || 'Institute Representative';
    const reviewer = reviewerId ? REVIEWERS[reviewerId] : null;
    const submittedAt = sub != null ? ago(sub) : null;
    const createdAt = ago((sub ?? upd) + 2);
    const flagged = REQUIRED_DOCS[flaggedIndex(seq)];
    const nextFlagged = REQUIRED_DOCS[(flaggedIndex(seq) + 1) % REQUIRED_DOCS.length];

    const history = [ev(createdAt, contact, 'institute', 'created', 'Application created as a draft.')];
    if (submittedAt) {
      history.push(ev(submittedAt, contact, 'institute', 'submitted', 'Application submitted by the institute.'));
      history.push(
        status === 'Submitted' || status === 'Validation Pending'
          ? ev(submittedAt, 'Trackify (demo)', 'system', 'validation', status === 'Validation Pending' ? 'Queued for automated demo validation.' : 'Demo validation stage skipped or not yet run.')
          : ev(submittedAt, 'Trackify (demo)', 'system', 'validation', 'Automated demo checks completed: file types, sizes and required fields.'),
      );
    }
    if (['Under Review', 'Documents Required', 'Approved', 'Rejected'].includes(status)) {
      history.push(ev(ago(sub - 1), reviewer, 'officer', 'review_started', `Scrutiny started by ${reviewer}.`));
    }

    let deficiency = null;
    let decision = null;
    if (status === 'Documents Required') {
      deficiency = {
        reason: `The ${flagged.name} is missing and the ${nextFlagged.name} lacks required information. Please upload corrected files.`,
        items: [flagged.name, nextFlagged.name],
        requestedAt: ago(upd),
        requestedBy: reviewer,
      };
      history.push(ev(ago(upd), reviewer, 'officer', 'clarification_requested', deficiency.reason));
    }
    if (status === 'Approved') {
      decision = { outcome: 'Approved', reason: 'Demo checks satisfied. Simulated outcome only.', at: ago(upd), by: reviewer };
      history.push(ev(ago(upd + 1), reviewer, 'officer', 'review_complete', 'Review marked complete.'));
      history.push(ev(ago(upd), reviewer, 'officer', 'approved', 'Demo approval recorded. Simulated outcome only.'));
    }
    if (status === 'Rejected') {
      decision = { outcome: 'Rejected', reason: `${flagged.name} and the intake declaration were incomplete. Simulated outcome only.`, at: ago(upd), by: reviewer };
      history.push(ev(ago(upd + 1), reviewer, 'officer', 'review_complete', 'Review marked complete.'));
      history.push(ev(ago(upd), reviewer, 'officer', 'rejected', `Demo rejection recorded: ${decision.reason}`));
    }

    return {
      id,
      instituteId,
      applicationType: category,
      academicYear: year,
      proposedIntake: intake,
      programDetails: program,
      submittedAt,
      createdAt,
      updatedAt: ago(upd),
      status,
      priority,
      currentStage: STATUS_STAGE[status],
      assignedReviewerId: reviewerId,
      assignedReviewer: reviewer,
      complianceItems: complianceItemsFor(status, seq, rulesById),
      reviewHistory: history,
      reviewNotes: status === 'Under Review' ? 'Initial scrutiny started. Checking completeness of the attached documents against the demo rules.' : '',
      reviewComplete: status === 'Approved' || status === 'Rejected',
      deficiency,
      decision,
    };
  });
}
