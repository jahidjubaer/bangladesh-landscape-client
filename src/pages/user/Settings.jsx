import { useState, useEffect } from 'react';
import { UserRound, KeyRound, Camera } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Reveal from '../../components/ui/Reveal';
import { t } from '../../i18n';

function ProfileSection({ user, refreshUser }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email || '' });
  }, [user]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/me', form);
      await refreshUser();
      toast(t('settings.profileSaved'), 'success');
    } catch (err) {
      toast(err.response?.data?.message || t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post('/auth/avatar', fd);
      await refreshUser();
      toast(t('settings.profileSaved'), 'success');
    } catch (err) {
      toast(err.response?.data?.message || t('common.error'), 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <form onSubmit={saveProfile} className="card bg-base-100 shadow-md">
      <div className="card-body space-y-4">
        <h2 className="card-title gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <UserRound className="w-5 h-5" strokeWidth={1.8} />
          </span>
          {t('settings.profileSection')}
        </h2>

        <div className="flex items-center gap-4">
          <div className="avatar placeholder">
            {user?.avatarUrl ? (
              <div className="w-20 rounded-2xl"><img src={user.avatarUrl} alt={user.name} /></div>
            ) : (
              <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-2xl w-20 text-3xl">
                <span>{user?.name?.charAt(0)}</span>
              </div>
            )}
          </div>
          <label className="btn btn-outline btn-sm rounded-full gap-1.5">
            {uploading ? <span className="loading loading-spinner loading-xs"></span> : <Camera className="w-4 h-4" />}
            {t('settings.changePhoto')}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadAvatar} disabled={uploading} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('settings.name')}</span>
            <input required minLength={2} className="input input-bordered" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('settings.email')}</span>
            <input type="email" className="input input-bordered" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
        </div>
        <div className="text-sm text-base-content/50">📱 {user?.phone}</div>

        <button type="submit" className="btn btn-primary btn-sm rounded-full w-fit" disabled={saving}>
          {saving ? t('admin.saving') : t('settings.saveProfile')}
        </button>
      </div>
    </form>
  );
}

function PasswordSection() {
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    if (form.next !== form.confirm) {
      toast(t('settings.passwordMismatch'), 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: form.current, newPassword: form.next });
      setForm({ current: '', next: '', confirm: '' });
      toast(t('settings.passwordChanged'), 'success');
    } catch (err) {
      toast(err.response?.data?.message || t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={changePassword} className="card bg-base-100 shadow-md">
      <div className="card-body space-y-4">
        <h2 className="card-title gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <KeyRound className="w-5 h-5" strokeWidth={1.8} />
          </span>
          {t('settings.passwordSection')}
        </h2>

        <label className="form-control">
          <span className="label-text font-semibold mb-1">{t('settings.currentPassword')}</span>
          <input type="password" required className="input input-bordered" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} autoComplete="current-password" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('settings.newPassword')}</span>
            <input type="password" required minLength={6} className="input input-bordered" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} autoComplete="new-password" />
          </label>
          <label className="form-control">
            <span className="label-text font-semibold mb-1">{t('settings.confirmPassword')}</span>
            <input type="password" required minLength={6} className="input input-bordered" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
          </label>
        </div>

        <button type="submit" className="btn btn-accent btn-sm rounded-full w-fit" disabled={saving}>
          {saving ? t('admin.saving') : t('settings.changeBtn')}
        </button>
      </div>
    </form>
  );
}

export default function Settings() {
  const { user, refreshUser } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-3xl font-extrabold">{t('settings.title')}</h1>
      <Reveal><ProfileSection user={user} refreshUser={refreshUser} /></Reveal>
      <Reveal delay={0.08}><PasswordSection /></Reveal>
    </div>
  );
}
