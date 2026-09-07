import { useEffect, useRef, useState } from 'react';
import * as miscApi from '../api/misc';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  const load = () => miscApi.notifications().then(setItems).catch(() => {});

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const openPanel = async () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      await miscApi.markAllNotificationsRead().catch(() => {});
      setItems((list) => list.map((n) => ({ ...n, is_read: true })));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={openPanel} className="relative h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600" aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 card p-0 shadow-lg z-40 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-100 font-medium text-sm text-slate-700">Notifications</div>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 px-4 py-6 text-center">You're all caught up.</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className="px-4 py-3 border-b border-slate-50 last:border-0">
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-300 mt-1">{timeAgo(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
