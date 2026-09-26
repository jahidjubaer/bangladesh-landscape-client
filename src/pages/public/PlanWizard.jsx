import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDistricts, useDistrict } from '../../features/districts/queries';
import { useGeneratePlan } from '../../features/plans/queries';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { t } from '../../i18n';

const FOODS = ['local', 'special', 'regular'];
const STYLES = ['adventure', 'relaxed', 'family', 'other'];

export default function PlanWizard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: districts } = useDistricts();
  const generate = useGeneratePlan();

  const [step, setStep] = useState(1);
  const [districtSlug, setDistrictSlug] = useState('');
  const [selectedSpots, setSelectedSpots] = useState([]);
  const [form, setForm] = useState({
    members: 4,
    days: 3,
    nights: 2,
    budget: 20000,
    startDate: '',
    foodPref: 'local',
    exploreStyle: 'adventure',
    stayPref: 'any',
  });
  const [error, setError] = useState('');

  const { data: districtData } = useDistrict(districtSlug);
  const district = districtData?.district;
  const spots = districtData?.spots || [];

  // Stay options limited by what this district actually has
  const stayOptions = ['any', ...(district?.stayTypesAvailable || [])];

  function toggleSpot(id) {
    setSelectedSpots((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleGenerate() {
    setError('');
    try {
      const { publicId } = await generate.mutateAsync({
        district: district._id,
        spots: selectedSpots,
        ...form,
        members: Number(form.members),
        days: Number(form.days),
        nights: Number(form.nights),
        budget: Number(form.budget),
        startDate: form.startDate || undefined,
      });
      navigate(`/plans/${publicId}`);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    }
  }

  if (authLoading) return <Loader fullScreen />;

  if (!user) {
    return (
      <div className="text-center py-24 px-4">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-6">{t('plan.loginRequired')}</h1>
        <Link to="/login" state={{ from: '/plan' }} className="btn btn-primary">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  if (generate.isPending) {
    return (
      <div className="text-center py-24 px-4">
        <span className="loading loading-dots loading-lg text-primary"></span>
        <h1 className="text-2xl font-bold mt-4 mb-2">{t('plan.generating')}</h1>
        <p className="text-base-content/70">{t('plan.generatingDesc')}</p>
      </div>
    );
  }

  const RadioGroup = ({ label, options, value, onChange, labelKey }) => (
    <div>
      <span className="label-text font-semibold block mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`btn btn-sm ${value === opt ? 'btn-primary' : 'btn-outline'}`}
          >
            {t(`${labelKey}.${opt}`)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('plan.wizardTitle')}</h1>

      <ul className="steps w-full mb-8">
        <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>{t('plan.step1')}</li>
        <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>{t('plan.step2')}</li>
        <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>{t('plan.step3')}</li>
      </ul>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(districts || []).map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => {
                    setDistrictSlug(d.slug);
                    setSelectedSpots([]);
                  }}
                  className={`card border-2 transition-colors text-left ${
                    districtSlug === d.slug ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50'
                  }`}
                >
                  <div className="card-body p-5">
                    <h2 className="card-title">{d.name.bn}</h2>
                    <p className="text-sm text-base-content/70 line-clamp-2">{d.overview?.bn}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-base-content/70 mb-4">{t('plan.selectSpotsHint')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {spots.map((s) => (
                  <label
                    key={s._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedSpots.includes(s._id) ? 'border-primary bg-primary/5' : 'border-base-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedSpots.includes(s._id)}
                      onChange={() => toggleSpot(s._id)}
                    />
                    <div>
                      <div className="font-semibold">{s.name.bn}</div>
                      <div className="text-xs text-base-content/60">
                        {t(`spot.category.${s.category}`)}
                        {s.isHidden && ` · 💎 ${t('district.hiddenGem')}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control">
                  <span className="label-text font-semibold mb-1">{t('plan.members')}</span>
                  <input type="number" min="1" max="100" className="input input-bordered" value={form.members} onChange={(e) => setField('members', e.target.value)} />
                </label>
                <label className="form-control">
                  <span className="label-text font-semibold mb-1">{t('plan.budget')}</span>
                  <input type="number" min="500" step="500" className="input input-bordered" value={form.budget} onChange={(e) => setField('budget', e.target.value)} />
                </label>
                <label className="form-control">
                  <span className="label-text font-semibold mb-1">{t('plan.days')}</span>
                  <input type="number" min="1" max="15" className="input input-bordered" value={form.days} onChange={(e) => setField('days', e.target.value)} />
                </label>
                <label className="form-control">
                  <span className="label-text font-semibold mb-1">{t('plan.nights')}</span>
                  <input type="number" min="0" max="15" className="input input-bordered" value={form.nights} onChange={(e) => setField('nights', e.target.value)} />
                </label>
                <label className="form-control sm:col-span-2">
                  <span className="label-text font-semibold mb-1">{t('plan.startDate')}</span>
                  <input type="date" className="input input-bordered" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
                </label>
              </div>

              <RadioGroup label={t('plan.foodPref')} options={FOODS} value={form.foodPref} onChange={(v) => setField('foodPref', v)} labelKey="plan.food" />
              <RadioGroup label={t('plan.explorePref')} options={STYLES} value={form.exploreStyle} onChange={(v) => setField('exploreStyle', v)} labelKey="plan.explore" />
              <RadioGroup label={t('plan.stayPref')} options={stayOptions} value={form.stayPref} onChange={(v) => setField('stayPref', v)} labelKey="plan.stay" />
            </div>
          )}

          <div className="card-actions justify-between mt-6">
            <button type="button" className="btn btn-ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
              ← {t('plan.back')}
            </button>
            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={(step === 1 && !districtSlug) || (step === 2 && selectedSpots.length === 0)}
                onClick={() => setStep(step + 1)}
              >
                {t('plan.next')} →
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleGenerate}>
                ✨ {t('plan.generate')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
