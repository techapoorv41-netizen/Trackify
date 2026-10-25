import { genId } from '@/utils/format';

export function createNotification({ title, message, category, relatedEntityId, audience, instituteId }) {
  return {
    id: genId('NTF'),
    title,
    message,
    category,
    createdAt: new Date().toISOString(),
    isRead: false,
    relatedEntityId: relatedEntityId || null,
    audience: audience || 'all',
    instituteId: instituteId || null,
  };
}

export function visibleNotifications(notifications, role, instituteId) {
  return notifications.filter((n) => {
    if (role === 'admin') return true;
    if (n.audience !== 'all' && n.audience !== role) return false;
    if (role === 'institute' && n.instituteId && n.instituteId !== instituteId) return false;
    return true;
  });
}

export function notificationLink(notification, role) {
  const id = notification.relatedEntityId;
  if (!id) return null;
  if (id.startsWith('TRK-')) {
    return role === 'institute' ? `/institute/applications/${id}` : `/officer/applications/${id}`;
  }
  if (id.startsWith('INS-')) {
    return role === 'institute' ? '/institute/compliance' : role === 'officer' ? `/officer/compliance?institute=${id}` : `/admin/institutes?open=${id}`;
  }
  return null;
}
