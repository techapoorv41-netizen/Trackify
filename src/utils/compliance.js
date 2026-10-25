export function complianceScore(records) {
  if (!records.length) return 0;
  const points = records.reduce((sum, r) => {
    if (r.status === 'Compliant') return sum + 1;
    if (r.status === 'Partially Compliant') return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((points / records.length) * 100);
}

export function isOpenIssue(record) {
  return record.status === 'Non-Compliant' || record.status === 'Partially Compliant';
}

export function activeRecords(records, rules) {
  const enabled = new Set(rules.filter((r) => r.enabled).map((r) => r.id));
  return records.filter((r) => enabled.has(r.ruleId));
}

export function overallStatus(records) {
  if (!records.length) return 'Evidence Pending';
  if (records.some((r) => r.status === 'Non-Compliant')) return 'Non-Compliant';
  if (records.some((r) => r.status === 'Partially Compliant')) return 'Partially Compliant';
  if (records.some((r) => r.status === 'Evidence Pending')) return 'Evidence Pending';
  return 'Compliant';
}
