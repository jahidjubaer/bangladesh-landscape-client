import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import api from '../lib/axios';
import { t } from '../i18n';

function renderMessage(n) {
  let msg = t(`notif.kind.${n.kind}`);
  for (const [k, v] of Object.entries(n.data || {})) {
    msg = msg.replaceAll(`{${k}}`, v ?? '');
  }
  return msg;
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return t('notif.justNow');
  if (s < 3600) return t('notif.minAgo').replace('{n}', Math.floor(s / 60));
  if (s < 86400) return t('notif.hourAgo').replace('{n}', Math.floor(s / 3600));
  return t('notif.dayAgo').replace('{n}', Math.floor(s / 86400));
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data.data, // { notifications, unread }
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const markRead = useMutation({
    mutationFn: async (id) =>
      id ? (await api.patch(`/notifications/${id}/read`)).data : (await api.patch('/notifications/read-all')).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const unread = data?.unread || 0;
  const items = data?.notifications || [];

  function openItem(n) {
    if (!n.readAt) markRead.mutate(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn btn-ghost btn-circle btn-sm"
        aria-label={t('notif.title')}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="indicator">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="indicator-item badge badge-error badge-xs px-1.5 font-bold text-[10px]">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-base-100 rounded-2xl shadow-xl border border-base-200 z-30 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-200">
              <span className="font-bold">{t('notif.title')}</span>
              {unread > 0 && (
                <button className="btn btn-ghost btn-xs gap-1 text-primary" onClick={() => markRead.mutate(null)}>
                  <CheckCheck className="w-3.5 h-3.5" /> {t('notif.markAll')}
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-base-content/40">
                  <Inbox className="w-8 h-8 mb-2" strokeWidth={1.5} />
                  <span className="text-sm">{t('notif.empty')}</span>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => openItem(n)}
                    className={`w-full text-left px-4 py-3 border-b border-base-200 last:border-0 hover:bg-base-200 transition-colors flex gap-2.5 ${
                      n.readAt ? 'opacity-65' : 'bg-primary/5'
                    }`}
                  >
                    {!n.readAt && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />}
                    <span className={n.readAt ? 'ps-4' : ''}>
                      <span className="block text-sm leading-snug">{renderMessage(n)}</span>
                      <span className="block text-xs text-base-content/45 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
