import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  MapPin, ListChecks, SlidersHorizontal, Sparkles, Check, ArrowLeft, ArrowRight,
  Camera, Lock, Users, Wallet, CalendarDays, Moon, Sun,
} from 'lucide-react';
import { useDistricts, useDistrict } from '../../features/districts/queries';
import { useGeneratePlan } from '../../features/plans/queries';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import Img from '../../components/ui/Img';
import Seo from '../../components/Seo';
import { t } from '../../i18n';

const FOODS = ['local', 'special', 'regular'];
const STYLES = ['adventure', 'relaxed', 'family', 'other'];
const STEPS = [
  { label: t('plan.step1'), Icon: MapPin },
  { label: t('plan.step2'), Icon: ListChecks },
  { label: t('plan.step3'), Icon: SlidersHorizontal },
];

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
};

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map(({ label, Icon }, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div className="w-10 sm:w-20 h-0.5 mx-1 rounded bg-base-300 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: step > i ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                  done ? 'bg-success text-success-content' : active ? 'bg-primary text-primary-content shadow-lg shadow-primary/30' : 'bg-base-100 text-base-content/40 border border-base-300'
                }`}
              >
                {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </motion.div>
              <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-base-content/50'}`}>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const GEN_MESSAGES = [t('plan.gen1'), t('plan.gen2'), t('plan.gen3'), t('plan.gen4')];

function GeneratingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => Math.min(i + 1, GEN_MESSAGES.length - 1)), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
      <motion.div
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center shadow-xl shadow-primary/30 mb-6"
        animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className="w-9 h-9" />
      </motion.div>
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-3">{t('plan.generating')}</h1>
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-base-content/60"
        >
          {GEN_MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>
      <progress className="progress progress-primary w-56 mt-6"></progress>
    </div>
  );
}

function ChoiceChips({ label, options, value, onChange, labelKey, icon: Icon }) {
  return (
    <div>
      <span className="label-text font-semibold flex items-center gap-2 mb-2.5">
        {Icon && <Icon className="w-4 h-4 text-primary" />} {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <motion.button
            key={opt}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt)}
            className={`btn btn-sm rounded-full px-5 ${value === opt ? 'btn-primary shadow-md shadow-primary/25' : 'btn-outline border-base-300'}`}
          >
            {t(`${labelKey}.${opt}`)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function PlanWizard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: districts } = useDistricts();
  const generate = useGeneratePlan();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [districtSlug, setDistrictSlug] = useState('');
  const [selectedSpots, setSelectedSpots] = useState([]);
  const [form, setForm] = useState({
    members: 4, days: 3, nights: 2, budget: 20000, startDate: '',
    foodPref: 'local', exploreStyle: 'adventure', stayPref: 'any',
  });
  const [error, setError] = useState('');

  const { data: districtData } = useDistrict(districtSlug);
  const district = districtData?.district;
  const spots = districtData?.spots || [];
  const stayOptions = ['any', ...(district?.stayTypesAvailable || [])];

  const goStep = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };
  const toggleSpot = (id) =>
    setSelectedSpots((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

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
      <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-5">
          <Lock className="w-9 h-9" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold mb-6">{t('plan.loginRequired')}</h1>
        <Link to="/login" state={{ from: '/plan' }} className="btn btn-primary rounded-full px-8">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  if (generate.isPending) return <GeneratingScreen />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Seo title={t('plan.wizardTitle')} description={t('home.heroSubtitle')} />
      <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-8 text-center">{t('plan.wizardTitle')}</h1>

      <StepIndicator step={step} />

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="card bg-base-100 shadow-lg overflow-hidden">
        <div className="card-body">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(districts || []).map((d) => (
                    <motion.button
                      key={d.slug}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setDistrictSlug(d.slug);
                        setSelectedSpots([]);
                      }}
                      className={`relative rounded-2xl overflow-hidden text-left h-40 img-zoom border-2 transition-colors ${
                        districtSlug === d.slug ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <Img src={d.heroImageUrl} alt={d.name.bn} icon={MapPin} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral/80 to-transparent" />
                      <div className="absolute bottom-3 left-4 text-neutral-content">
                        <span className="font-display text-xl font-bold">{d.name.bn}</span>
                      </div>
                      {districtSlug === d.slug && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center shadow"
                        >
                          <Check className="w-4 h-4" />
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-base-content/60">{t('plan.selectSpotsHint')}</p>
                    <span className="badge badge-primary badge-outline">
                      {t('plan.selectedCount')}: {selectedSpots.length.toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {spots.map((s) => {
                      const selected = selectedSpots.includes(s._id);
                      return (
                        <motion.button
                          key={s._id}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleSpot(s._id)}
                          className={`relative flex items-center gap-3 p-2.5 rounded-2xl border-2 text-left transition-colors ${
                            selected ? 'border-primary bg-primary/5' : 'border-base-200 hover:border-primary/40'
                          }`}
                        >
                          <Img src={s.images?.[0]} alt={s.name.bn} icon={Camera} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{s.name.bn}</div>
                            <div className="text-xs text-base-content/55">
                              {t(`spot.category.${s.category}`)}
                              {s.isHidden && ` · 💎`}
                            </div>
                          </div>
                          <span
                            className={`ms-auto w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              selected ? 'bg-primary text-primary-content' : 'border-2 border-base-300'
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5" />}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  {/* Trip summary chip row */}
                  <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-base-200">
                    <span className="badge badge-primary gap-1"><MapPin className="w-3 h-3" /> {district?.name?.bn}</span>
                    <span className="badge badge-ghost">{t('plan.selectedCount')}: {selectedSpots.length.toLocaleString('bn-BD')} স্পট</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="form-control">
                      <span className="label-text font-semibold flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-primary" /> {t('plan.members')}</span>
                      <input type="number" min="1" max="100" className="input input-bordered" value={form.members} onChange={(e) => setField('members', e.target.value)} />
                    </label>
                    <label className="form-control">
                      <span className="label-text font-semibold flex items-center gap-2 mb-1"><Wallet className="w-4 h-4 text-primary" /> {t('plan.budget')}</span>
                      <input type="number" min="500" step="500" className="input input-bordered" value={form.budget} onChange={(e) => setField('budget', e.target.value)} />
                    </label>
                    <label className="form-control">
                      <span className="label-text font-semibold flex items-center gap-2 mb-1"><Sun className="w-4 h-4 text-primary" /> {t('plan.days')}</span>
                      <input type="number" min="1" max="15" className="input input-bordered" value={form.days} onChange={(e) => setField('days', e.target.value)} />
                    </label>
                    <label className="form-control">
                      <span className="label-text font-semibold flex items-center gap-2 mb-1"><Moon className="w-4 h-4 text-primary" /> {t('plan.nights')}</span>
                      <input type="number" min="0" max="15" className="input input-bordered" value={form.nights} onChange={(e) => setField('nights', e.target.value)} />
                    </label>
                    <label className="form-control sm:col-span-2">
                      <span className="label-text font-semibold flex items-center gap-2 mb-1"><CalendarDays className="w-4 h-4 text-primary" /> {t('plan.startDate')}</span>
                      <input type="date" className="input input-bordered" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
                    </label>
                  </div>

                  <ChoiceChips label={t('plan.foodPref')} options={FOODS} value={form.foodPref} onChange={(v) => setField('foodPref', v)} labelKey="plan.food" />
                  <ChoiceChips label={t('plan.explorePref')} options={STYLES} value={form.exploreStyle} onChange={(v) => setField('exploreStyle', v)} labelKey="plan.explore" />
                  <ChoiceChips label={t('plan.stayPref')} options={stayOptions} value={form.stayPref} onChange={(v) => setField('stayPref', v)} labelKey="plan.stay" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8">
            <button type="button" className="btn btn-ghost rounded-full gap-1" disabled={step === 1} onClick={() => goStep(step - 1)}>
              <ArrowLeft className="w-4 h-4" /> {t('plan.back')}
            </button>
            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary rounded-full px-8 gap-1 shadow-lg shadow-primary/25"
                disabled={(step === 1 && !districtSlug) || (step === 2 && selectedSpots.length === 0)}
                onClick={() => goStep(step + 1)}
              >
                {t('plan.next')} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" className="btn btn-primary rounded-full px-8 gap-2 shadow-lg shadow-primary/25" onClick={handleGenerate}>
                <Sparkles className="w-4 h-4" /> {t('plan.generate')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
