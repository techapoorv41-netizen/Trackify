import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useScopedData } from '@/hooks/useScopedData';
import { notificationLink } from '@/services/notificationService';
import NotificationItem from '@/components/notifications/NotificationItem';
import EmptyState from '@/components/common/EmptyState';

export default function RecentNotifications({ limit = 4 }) {
  const { role, scoped, actions } = useScopedData();
  const navigate = useNavigate();
  const items = [...scoped.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);

  if (!items.length) return <EmptyState compact icon={Bell} title="No notifications" description="You're all caught up." />;

  return (
    <div className="-mx-5 divide-y divide-line">
      {items.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onDismiss={actions.dismissNotification}
          onOpen={(item) => {
            actions.markNotificationRead(item.id, true);
            navigate(notificationLink(item, role) || '/notifications');
          }}
        />
      ))}
    </div>
  );
}
