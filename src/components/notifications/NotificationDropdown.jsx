import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useScopedData } from '@/hooks/useScopedData';
import { notificationLink } from '@/services/notificationService';
import NotificationItem from '@/components/notifications/NotificationItem';
import EmptyState from '@/components/common/EmptyState';
import useClickOutside from '@/components/layout/useClickOutside';
import { useToast } from '@/context/ToastContext';

export default function NotificationDropdown() {
  const { role, scoped, actions } = useScopedData();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrap, close, open);

  const all = [...scoped.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unread = all.filter((n) => !n.isRead);
  const latest = all.slice(0, 6);

  const openItem = (n) => {
    actions.markNotificationRead(n.id, true);
    setOpen(false);
    const to = notificationLink(n, role);
    if (to) navigate(to);
    else navigate('/notifications');
  };

  return (
    <div className="relative" ref={wrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink"
      >
        <Bell size={19} aria-hidden="true" />
        {unread.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-line bg-card shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Notifications</h2>
            <button
              type="button"
              disabled={!unread.length}
              onClick={() => {
                actions.markAllNotificationsRead(unread.map((n) => n.id));
                toast.success('All notifications marked as read');
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-accent hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          </div>
          <div className="scroll-thin max-h-[22rem] divide-y divide-line overflow-y-auto">
            {latest.length ? (
              latest.map((n) => (
                <NotificationItem key={n.id} notification={n} onOpen={openItem} onDismiss={actions.dismissNotification} />
              ))
            ) : (
              <EmptyState compact icon={Bell} title="You're all caught up" description="New notifications will appear here." />
            )}
          </div>
          <div className="border-t border-line p-2">
            <Link to="/notifications" onClick={() => setOpen(false)} className="block rounded-lg py-2 text-center text-sm font-semibold text-accent hover:bg-accent-50">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
