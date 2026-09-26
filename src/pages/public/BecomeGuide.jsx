import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDistricts } from '../../features/districts/queries';
import { useApplyGuide } from '../../features/guides/queries';
import { t } from '../../i18n';

const LANGS = ['bangla', 'english', 'local'];

// Defined outside the page component so inputs keep focus across re-renders
function Input({ label, value, onChange, type = 'text', required, ...props }) {
  return (
    <label className="form-control">
      <span className="label-text mb-1 font-semibold">{label}{required && ' *'}</span>
      <input type={type} required={required} className="input input-bordered" value={value} onChange={onChange} {...props} />
    </label>
  );
}

export default function BecomeGuide() {
  const { user } = useAuth();
  const { data: districts } = useDistricts();
  const apply = useApplyGuide();
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    name: '', phone: '', password: '',
    nidNumber: '', address: '', facebookUrl: '', education: '',
    whatsappNumber: '', experienceSummary: '', bio: '',
    dailyRate: 1500, experienceYears: 1,
    districts: [], languages: ['bangla'],
    nidFile: null, certFile: null,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => set(k, form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const fd = new FormData();
      if (!user) {
        fd.append('name', form.name);
        fd.append('phone', form.phone);
        fd.append('password', form.password);
      }
      ['nidNumber', 'address', 'facebookUrl', 'education', 'whatsappNumber', 'experienceSummary', 'bio', 'dailyRate', 'experienceYears'].forEach((k) => fd.append(k, form[k]));
      fd.append('districts', form.districts.join(','));
      fd.append('languages', form.languages.join(','));
      if (form.nidFile) fd.append('nidFile', form.nidFile);
      if (form.certFile) fd.append('certFile', form.certFile);

      await apply.mutateAsync(fd);
      setMessage({ type: 'success', text: t('guide.applied') });
      window.scrollTo(0, 0);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('common.error') });
      window.scrollTo(0, 0);
    }
  }

  const fieldProps = (field) => ({ value: form[field], onChange: (e) => set(field, e.target.value) });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">ðŸ§­</div>
        <h1 className="text-3xl font-bold mb-2">{t('guide.becomeGuideTitle')}</h1>
        <p className="text-base-content/70">{t('guide.becomeGuideDesc')}</p>
      </div>

      {message && <div className={`alert alert-${message.type} mb-6`}>{message.text}</div>}

      {message?.type !== 'success' && (
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-lg">
          <div className="card-body space-y-4">
            {!user && (
              <>
                <div className="alert text-sm py-2">ðŸ’¡ {t('guide.accountNote')}</div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label={t('auth.name')} {...fieldProps("name")} required />
                  <Input label={t('auth.phone')} {...fieldProps("phone")} required placeholder="01XXXXXXXXX" />
                  <Input label={t('auth.password')} {...fieldProps("password")} type="password" required minLength={6} />
                </div>
                <div className="divider my-0"></div>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('guide.nidNumber')} {...fieldProps("nidNumber")} required />
              <Input label={t('guide.whatsapp')} {...fieldProps("whatsappNumber")} required placeholder="01XXXXXXXXX" />
              <label className="form-control sm:col-span-2">
                <span className="label-text mb-1 font-semibold">{t('guide.address')} *</span>
                <input required className="input input-bordered" value={form.address} onChange={(e) => set('address', e.target.value)} />
              </label>
              <Input label={t('guide.facebook')} {...fieldProps("facebookUrl")} placeholder="https://facebook.com/..." />
              <Input label={t('guide.education')} {...fieldProps("education")} />
              <Input label={t('guide.dailyRate')} {...fieldProps("dailyRate")} type="number" min="0" />
              <Input label={t('guide.expYears')} {...fieldProps("experienceYears")} type="number" min="0" />
            </div>

            <label className="form-control">
              <span className="label-text mb-1 font-semibold">{t('guide.expSummary')}</span>
              <textarea rows={3} className="textarea textarea-bordered" value={form.experienceSummary} onChange={(e) => set('experienceSummary', e.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text mb-1 font-semibold">{t('guide.bio')}</span>
              <textarea rows={2} className="textarea textarea-bordered" value={form.bio} onChange={(e) => set('bio', e.target.value)} />
            </label>

            <div>
              <span className="label-text font-semibold block mb-2">{t('guide.districtsCovered')} *</span>
              <div className="flex flex-wrap gap-3">
                {(districts || []).map((d) => (
                  <label key={d.slug} className="label cursor-pointer gap-2">
                    <input type="checkbox" className="checkbox checkbox-sm" checked={form.districts.includes(d.slug)} onChange={() => toggle('districts', d.slug)} />
                    <span className="label-text">{d.name.bn}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="label-text font-semibold block mb-2">{t('guide.languages')}</span>
              <div className="flex flex-wrap gap-3">
                {LANGS.map((l) => (
                  <label key={l} className="label cursor-pointer gap-2">
                    <input type="checkbox" className="checkbox checkbox-sm" checked={form.languages.includes(l)} onChange={() => toggle('languages', l)} />
                    <span className="label-text">{t(`guide.lang.${l}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-control">
                <span className="label-text mb-1 font-semibold">{t('guide.nidFile')} *</span>
                <input type="file" required accept="image/*,.pdf" className="file-input file-input-bordered" onChange={(e) => set('nidFile', e.target.files?.[0] || null)} />
              </label>
              <label className="form-control">
                <span className="label-text mb-1 font-semibold">{t('guide.certFile')}</span>
                <input type="file" accept="image/*,.pdf" className="file-input file-input-bordered" onChange={(e) => set('certFile', e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="alert alert-info text-sm py-2">ðŸ”’ {t('guide.privacyNote')}</div>

            <button type="submit" className="btn btn-primary" disabled={apply.isPending || form.districts.length === 0}>
              {apply.isPending ? t('guide.applying') : t('guide.applyBtn')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
