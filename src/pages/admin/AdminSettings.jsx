import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

const FIELDS = [
  ['planPrice', 'প্ল্যান PDF মূল্য (টাকা)', 'number'],
  ['freePlanCreditsForNewUser', 'নতুন ইউজারের ফ্রি ক্রেডিট', 'number'],
  ['guideCommissionPct', 'গাইড কমিশন (%)', 'number'],
  ['listingCommissionPct', 'হোটেল/বোট বুকিং কমিশন (%)', 'number'],
  ['bookingConfirmWindowHours', 'বুকিং কনফার্ম সময়সীমা (ঘণ্টা)', 'number'],
  ['bkashPersonalNumber', 'bKash পার্সোনাল নম্বর (Send Money)', 'text'],
];

export default function AdminSettings() {
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => (await api.get('/admin/settings')).data.data.settings,
  });

  useEffect(() => {
    if (settings) {
      setForm(Object.fromEntries(FIELDS.map(([k]) => [k, settings[k] ?? ''])));
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async (payload) => (await api.patch('/admin/settings', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries();
      setMessage({ type: 'success', text: '✓ সংরক্ষিত' });
    },
    onError: (err) => setMessage({ type: 'error', text: err.response?.data?.message || t('common.error') }),
  });

  if (isLoading || !form) return <Loader />;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t('admin.settings')}</h1>
      {message && <div className={`alert alert-${message.type} mb-4 text-sm py-2`}>{message.text}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setMessage(null);
          save.mutate(form);
        }}
        className="card bg-base-100 shadow-md"
      >
        <div className="card-body space-y-3">
          {FIELDS.map(([key, label, type]) => (
            <label key={key} className="form-control">
              <span className="label-text font-semibold mb-1">{label}</span>
              <input
                type={type}
                className="input input-bordered"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
              />
            </label>
          ))}
          <div className="text-xs text-base-content/60">
            💡 bKash নম্বর সেট করলে প্ল্যান পেজে "bKash-এ পেমেন্ট" অপশন দেখা যাবে; খালি রাখলে লুকানো থাকবে।
          </div>
          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? t('admin.saving') : t('admin.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
