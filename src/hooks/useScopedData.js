import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { usePrefs } from '@/context/PrefsContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { visibleNotifications } from '@/services/notificationService';
import { activeRecords } from '@/utils/compliance';

/**
 * Role-scoped views over the single shared store.
 * Scoping here is a frontend demo behaviour, not production access control.
 */
export function useScopedData() {
  const data = useData();
  const { prefs } = usePrefs();
  const { user, role, instituteId } = useCurrentUser();

  return useMemo(() => {
    const { applications, documents, institutes, compliance, deadlines, rules, notifications, users } = data;

    const scopedApplications =
      role === 'institute' ? applications.filter((a) => a.instituteId === instituteId)
        : role === 'officer' ? applications.filter((a) => a.status !== 'Draft')
          : applications;

    const appIds = new Set(scopedApplications.map((a) => a.id));
    const scopedDocuments = documents.filter((d) => appIds.has(d.applicationId));

    const ruleById = Object.fromEntries(rules.map((r) => [r.id, r]));
    const enriched = activeRecords(compliance, rules).map((rec) => {
      const rule = ruleById[rec.ruleId];
      return { ...rec, requirement: rule.name, description: rule.description, category: rule.category, severity: rule.severity };
    });
    const scopedCompliance = role === 'institute' ? enriched.filter((r) => r.instituteId === instituteId) : enriched;

    const scopedInstitutes = role === 'institute' ? institutes.filter((i) => i.id === instituteId) : institutes;

    const scopedDeadlines =
      role === 'institute' ? deadlines.filter((d) => d.audience === 'institute' && d.instituteId === instituteId)
        : role === 'officer' ? deadlines.filter((d) => d.audience === 'officer')
          : deadlines;

    const scopedNotifications = visibleNotifications(notifications, role, instituteId).filter(
      (n) => !prefs.mutedCategories.includes(n.category),
    );

    return {
      ...data,
      role,
      user,
      instituteId,
      institute: institutes.find((i) => i.id === instituteId) || null,
      instituteById: Object.fromEntries(institutes.map((i) => [i.id, i])),
      userById: Object.fromEntries(users.map((u) => [u.id, u])),
      scoped: {
        applications: scopedApplications,
        documents: scopedDocuments,
        compliance: scopedCompliance,
        institutes: scopedInstitutes,
        deadlines: scopedDeadlines,
        notifications: scopedNotifications,
      },
      allCompliance: enriched,
    };
  }, [data, prefs.mutedCategories, role, user, instituteId]);
}
