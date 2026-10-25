export const APP_NAME = 'Trackify';
export const APP_TAGLINE = 'AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System';
export const DEMO_NOTICE =
  'Prototype demonstration. All institutes, people, applications and rules shown here are fictional and stored only in this browser.';

export const MAX_FILE_MB = 10;
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png'];

export const ROLES = {
  institute: { key: 'institute', label: 'Institute', home: '/institute/dashboard', blurb: 'Submit applications, upload documents and track compliance.' },
  officer: { key: 'officer', label: 'AICTE Officer', home: '/officer/dashboard', blurb: 'Scrutinise applications and record simulated review decisions.' },
  admin: { key: 'admin', label: 'Admin', home: '/admin/dashboard', blurb: 'Configure users, rules, workflows, alerts and audit history.' },
};
export const ROLE_KEYS = Object.keys(ROLES);

export const DEMO_USER_IDS = { institute: 'U-001', officer: 'U-101', admin: 'U-201' };

export const STATUSES = ['Draft', 'Submitted', 'Validation Pending', 'Under Review', 'Documents Required', 'Approved', 'Rejected'];
export const ACTIVE_STATUSES = ['Submitted', 'Validation Pending', 'Under Review', 'Documents Required'];
export const PENDING_STATUSES = ['Submitted', 'Validation Pending', 'Under Review'];
export const DECIDED_STATUSES = ['Approved', 'Rejected'];

export const PRIORITIES = ['High', 'Medium', 'Low'];
export const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

export const APPLICATION_CATEGORIES = [
  'New Institution',
  'Extension of Approval',
  'Increase in Intake',
  'New Course / Program',
  'Closure of Course',
  'Change of Name / Location',
];
export const ACADEMIC_YEARS = ['2025-26', '2026-27', '2027-28'];
export const INSTITUTION_TYPES = [
  'Engineering College',
  'Polytechnic',
  'Management Institute',
  'Pharmacy Institute',
  'University Department',
  'Architecture & Planning Institute',
];
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export const DOC_CATEGORIES = [
  'Faculty Records',
  'Infrastructure Details',
  'Academic Information',
  'Mandatory Disclosures',
  'Supporting Documents',
];

export const REQUIRED_DOCS = [
  { key: 'faculty', name: 'Faculty Roster', category: 'Faculty Records', ext: 'xlsx', hint: 'Faculty names, designations and qualification fields (spreadsheet or PDF).' },
  { key: 'infra', name: 'Infrastructure Summary', category: 'Infrastructure Details', ext: 'pdf', hint: 'Buildings, laboratories, library and learning resources summary.' },
  { key: 'academic', name: 'Course & Intake Details', category: 'Academic Information', ext: 'pdf', hint: 'Program-wise intake and academic structure.' },
  { key: 'disclosure', name: 'Mandatory Disclosure Statement', category: 'Mandatory Disclosures', ext: 'pdf', hint: 'Public disclosure statement for the academic year.' },
  { key: 'support', name: 'Supporting Letter / Undertaking', category: 'Supporting Documents', ext: 'docx', hint: 'Signed covering letter or undertaking from the institute head.' },
];

export const VALIDATION_STATUSES = ['File Received', 'Completeness Check Passed', 'Missing Information', 'Review Required'];
export const COMPLIANCE_STATUSES = ['Compliant', 'Partially Compliant', 'Non-Compliant', 'Evidence Pending'];
export const COMPLIANCE_CATEGORIES = ['Faculty', 'Infrastructure', 'Approved Intake', 'Mandatory Disclosures'];
export const SEVERITIES = ['High', 'Medium', 'Low'];

export const ALERT_CATEGORIES = ['Application Deadline', 'Missing Documents', 'Compliance Issue', 'Pending Review', 'Status Update'];
export const ALERT_DELIVERY = ['Draft', 'Scheduled', 'Sent in-app (simulated)'];
export const NOTIFICATION_CATEGORIES = ['Application Update', 'Document Deficiency', 'Deadline Reminder', 'Compliance', 'System'];
export const REMINDER_FREQUENCIES = ['Once', 'Daily', 'Every 3 days', 'Weekly'];

export const STAGES = [
  { key: 'created', label: 'Application Created' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'validation', label: 'Automated Validation' },
  { key: 'review', label: 'Officer Review' },
  { key: 'clarification', label: 'Clarification' },
  { key: 'decision', label: 'Final Decision' },
];

export const STATUS_STAGE = {
  Draft: 'created',
  Submitted: 'submitted',
  'Validation Pending': 'validation',
  'Under Review': 'review',
  'Documents Required': 'clarification',
  Approved: 'decision',
  Rejected: 'decision',
};

export const SIMULATED_LABEL = 'Simulated demo action. No official regulatory decision is made.';
