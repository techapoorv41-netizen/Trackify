import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, FilterX } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import FilterDropdown from '@/components/common/FilterDropdown';
import EmptyState from '@/components/common/EmptyState';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { notificationLink } from '@/services/notificationService';
import { NOTIFICATION_CATEGORIES } from '@/utils/constants';

export default function NotificationsPage() {
  const { role, scoped, actions } = useScopedData();
  const navigate = useNavigate();
  const toast = useToast();
  const [category, setCategory] = useState('');
  const [read, setRead] = useState('');

  const all = scoped.notifications;
  const unread = all.filter((n) => !n.isRead);
  const rows = useMemo(() => all
    .filter((n) => (!category || n.category === category) && (!read || (read === 'Unread') === !n.isRead))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [all, category, read]);

  const open = (n) => {
    actions.markNotificationRead(n.id, true);
    const to = notificationLink(n, role);
    if (to) navigate(to);
  };

  return (
    <>
      <PageHeader title="Notifications" description={`${unread.length} unread of ${all.length}. Notification types muted in Settings are hidden.`}
        actions={<button type="button" className="btn btn-secondary" disabled={!unread.length} onClick={() => { actions.markAllNotificationsRead(unread.map((n) => n.id)); toast.success('All notifications marked as read'); }}><CheckCheck size={16} /> Mark all as read</button>} />
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <FilterDropdown className="w-full sm:w-56" label="Category" value={category} onChange={setCategory} options={NOTIFICATION_CATEGORIES} />
          <FilterDropdown className="w-full sm:w-48" label="Status" value={read} onChange={setRead} options={['Unread', 'Read']} />
          <button type="button" className="btn btn-ghost btn-sm" disabled={!(category || read)} onClick={() => { setCategory(''); setRead(''); }}><FilterX size={14} /> Clear filters</button>
        </div>
        {rows.length ? (
          <div className="divide-y divide-line">
            {rows.map((n) => <NotificationItem key={n.id} notification={n} showToggle onOpen={open} onDismiss={(id) => { actions.dismissNotification(id); toast.info('Notification dismissed'); }} onToggleRead={(item) => actions.markNotificationRead(item.id, !item.isRead)} />)}
          </div>
        ) : (
          <EmptyState icon={all.length ? FilterX : Bell} title={all.length ? 'No notifications match your filters' : "You're all caught up"} description={all.length ? 'Try clearing the filters.' : 'New notifications will appear here.'} />
        )}
      </div>
    </>
  );
}
