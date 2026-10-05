import { Bell, CheckCheck, Heart, MessageCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import type { Notification } from '../types';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try { const data = await api.notifications(); setItems(data.items); setUnread(data.unread); } catch { /* keep the feed usable when notifications are unavailable */ }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 3000);
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler);
  }, []);

  const mark = async (id: number) => { try { await api.markRead(id); setItems(current => current.map(n => n.id === id ? { ...n, is_read: true } : n)); setUnread(current => Math.max(0, current - 1)); } catch { /* ignore */ } };
  const markAll = async () => { try { await api.markAllRead(); setItems(current => current.map(n => ({ ...n, is_read: true }))); setUnread(0); } catch { /* ignore */ } };

  return <div className="notification-wrap" ref={ref}>
    <button className="icon-button notification-button" onClick={() => { setOpen(v => !v); void load(); }} aria-label="Notifications" title="Notifications">
      <Bell size={21} />{unread > 0 && <span className="notification-badge">{unread > 9 ? '9+' : unread}</span>}
    </button>
    {open && <div className="notification-panel">
      <div className="notification-head"><div><h3>Notifications</h3><span>{unread ? `${unread} new` : "You're all caught up"}</span></div>{items.length > 0 && <button onClick={markAll} className="mini-action"><CheckCheck size={15} /> Mark all read</button>}</div>
      <div className="notification-list">
        {items.length === 0 ? <div className="empty-notifications"><Bell size={28} /><p>No notifications yet.</p></div> : items.map(item => <button key={item.id} className={`notification-item ${item.is_read ? '' : 'unread'}`} onClick={() => !item.is_read && mark(item.id)}>
          <div className={`notif-icon ${item.type === 'like' ? 'like' : 'comment'}`}>{item.type === 'like' ? <Heart size={17} fill="currentColor" /> : <MessageCircle size={17} />}</div>
          <div><strong>{item.actor_name}</strong><p>{item.type === 'like' ? 'liked your post.' : 'commented on your post.'}</p><time>{new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</time></div>
          {!item.is_read && <span className="unread-dot" />}
        </button>)}
      </div>
      <button className="notification-close" onClick={() => setOpen(false)}><X size={15} /> Close</button>
    </div>}
  </div>;
}
